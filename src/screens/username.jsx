import React, { useState, useEffect, Component } from "react";
import { View, Text, StyleSheet, Dimensions, Image, Alert } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { StackActions, NavigationAction } from "@react-navigation/native";

const { width, height } = Dimensions.get("screen");

export default class UserNameScreen extends Component {
  state = {
    username: null,
    loading: false,
    appReady: false
  };
  checkForUsername = async () => {
    const userID = await firebase.auth().currentUser.uid;
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();

    if (user.data().username) {
      const resetAction = user.data().Angels
        ? StackActions.replace("Welcome")
        : StackActions.replace("Angels");
      this.props.navigation.dispatch(resetAction);
    } else {
      this.setState({ appReady: true });
    }
  };

  componentDidMount = async () => {
    await this.checkForUsername();
  };

  handleSubmit = async () => {
    if (this.state.username) {
      const userID = await firebase.auth().currentUser.uid;
      this.setState({ loading: true });
      const user = await firebase
        .firestore()
        .collection("Users")
        .doc(userID)
        .get();

      await user.ref.set({ username: this.state.username }, { merge: true });

      this.checkForUsername();

      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "transparent"
            }}
          >
            <Loading />
          </View>
        ) : null}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/test.png")}
            style={{ width: width / 1.5, height: width / 1.5 }}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.message}>What Should We Call You ? </Text>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor={colors.placeholderColor}
            onChangeText={(text) => this.setState({ username: text })}
            maxLength={11}
          />
          <TouchableOpacity
            disabled={!this.state.appReady}
            onPress={this.handleSubmit}
            style={[
              styles.button,
              {
                backgroundColor: this.state.appReady
                  ? colors.primary
                  : colors.placeholderColor
              }
            ]}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background
  },
  imageContainer: {
    flex: 0.5,
    width,
    alignItems: "center",
    justifyContent: "center"
  },
  textContainer: {
    flex: 0.5,
    width,
    alignItems: "center"
  },
  input: {
    borderRadius: 20,
    width: width / 1.05,
    fontSize: 18,
    marginVertical: 30,
    borderBottomColor: colors.placeholderColor,
    borderBottomWidth: 2,
    color: colors.whiteText,
    textAlign: "center",
    padding: 10
  },
  message: {
    color: colors.whiteText,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center"
  },
  button: {
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
    width: width / 1.8,
    marginVertical: 20
  },
  buttonText: {
    color: colors.whiteText,
    fontWeight: "600",
    fontSize: 18
  }
});
