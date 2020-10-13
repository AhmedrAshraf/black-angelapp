import React, { Component } from "react";
import { View, Text, StyleSheet, Dimensions, Image, Alert } from "react-native";
import { colors } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import firebase from "firebase";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";
import { StackActions } from "@react-navigation/native";
import { connect } from "react-redux";
import * as Types from "../store/types";

const { width, height } = Dimensions.get("screen");

class Welcome extends Component {
  state = {
    angels: []
  };
  handlePress = () => {
    const resetAction = StackActions.replace("Home");
    this.props.navigation.dispatch(resetAction);
  };

  componentDidMount = async () => {
    let token = await this.registerForPushNotifications();
    this.assignUIDForTheUser();
    this.sendNotificationToAngels();
  };

  sendNotificationToAngels = async (cb) => {
    // Fetch Angels From User Account
    const currentUser = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    this.props.loginUser(currentUser.data());

    currentUser.data().Angels
      ? currentUser.data().Angels.map(async (angel) => {
          // Fetch Each Angel's Account
          const _angel = await firebase
            .firestore()
            .collection("Users")
            .doc(angel)
            .get();

          // Send Notification To Each Angel

          let response = fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              to: _angel.data().token,
              sound: "default",
              title: `Black Angel Alert`,
              body: `${
                currentUser.data().username
              } is in danger! please check on them`
            })
          });
        })
      : null;
  };

  generateNewUID = () => {
    const str = Date.now();
    const uid = str
      .toString()
      .slice(str.toString().length - 5, str.toString().length);
    return uid;
  };

  checkUserIDInOtherDocuments = async (uid) => {
    const users = await firebase.firestore().collection("Users").get();

    const duplicates = users.docs.find((doc) => doc.data.UID === uid);

    if (duplicates.length > 0) return false;
    else return true;
  };

  assignUIDForTheUser = async () => {
    const userID = await firebase.auth().currentUser.uid;
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();
    if (user.data().UID) return;

    const UID = this.generateNewUID();

    const validUID = await this.checkUserIDInOtherDocuments();

    if (validUID) await user.ref.set({ UID }, { merge: true });
    else this.assignUIDForTheUser();
  };

  registerForPushNotifications = async () => {
    let user = firebase.auth().currentUser.uid;
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      console.log("-===--", finalStatus);
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      const db = firebase.firestore();
      db.collection("Users")
        .doc(user)
        .set(
          {
            token: token ? token : ""
          },
          { merge: true }
        )
        .then((data) => {});

      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C"
      });
    }

    return token;
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mainApp}>
          <View style={[styles.centerAlign, { height: height / 1.15 }]}>
            <Image
              source={require("../assets/images/test.png")}
              style={styles.image}
            />
            <TouchableOpacity onPress={this.handlePress} style={styles.button}>
              <Text style={styles.buttonText}>Enter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) => ({
  loginUser: (user) =>
    dispatch({
      type: Types.loginUser,
      payload: {
        user: user
      }
    })
});

const connectComponent = connect(mapStateToProps, mapDispatchToProps);

const styles = StyleSheet.create({
  mainApp: {
    width,
    position: "absolute",
    top: height / 10,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000"
  },
  container: {
    backgroundColor: colors.primary,
    width,
    height
  },
  centerAlign: {
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: 300,
    height: 300
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingHorizontal: 80,
    borderRadius: 20,
    marginVertical: 50
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.whiteText
  }
});

export default connectComponent(Welcome);
