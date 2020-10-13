import React, { useEffect, useState, Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Alert,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors } from "../constants/theme";
import { Header, Prompt, MessageBOX } from "../components";
const { width, height } = Dimensions.get("screen");
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { StackActions, StackRouter } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

class DistanceCalculator {
  static calculateDistanceBetweenTwoPoints = (
    lat1,
    lat2,
    long1,
    long2,
    unit
  ) => {
    if (lat1 == lat2 && long1 == long2) {
      return 0;
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;

      let theta = long1 - long2;

      let radtheta = (Math.PI * theta) / 180;

      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  };
}

class Home extends Component {
  state = {
    hasLocationPermission: false,
    locationResult: null,
    mapRegion: null,
    currentUser: null,
    publicAngels: [],
    angels: [],
    animation: new Animated.Value(0),
    d_animation: new Animated.Value(0),
    modalVisible: false,
    problem: null,
    loading: false,
    boxVisibility: false,
    currentAngel: null,
    nearbyUsers: null,
  };

  blinkAnimation = () => {
    Animated.loop(
      Animated.timing(this.state.animation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ).start();
  };

  dangerousAnimation = () => {
    Animated.loop(
      Animated.timing(this.state.d_animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ).start();
  };

  getPublicAngels = async () => {
    const currentUser = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    const angels = currentUser.data().Angels;

    angels
      ? angels.map(async (_angel) => {
          const angel = await firebase
            .firestore()
            .collection("Users")
            .doc(_angel)
            .get();

          if (angel)
            this.setState({
              publicAngels: [...this.state.publicAngels, angel],
            });
        })
      : null;
  };

  AppendHelpToHistory = async () => {
    const History = await firebase
      .firestore()
      .collection("History")
      .doc("helpHistory")
      .get();

    const { history } = History.data();

    const data = {
      id: Date.now(),
      timestamp: new Date().toString(),
      problem: this.state.problem,
      user: firebase.auth().currentUser.uid,
    };

    await History.ref.set({ history: [...history, data] }, { merge: true });
  };

  RequestHelp = async () => {
    // const userID = await firebase.auth().currentUser.uid;

    this.setState({ modalVisible: true });

    // Send Notification to Angels

    this.state.publicAngels.map((angel) => {
      let response = fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: angel.data().token,
          sound: "default",
          title: `${
            this.state.currentUser ? this.state.currentUser.username : "User"
          } From Black Angel`,
          body: `${this.state.problem}`,
        }),
      });
    });
  };

  fetchUsersWhoHaveProblemInTwentyMileRadius = async () => {
    const _user = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    const angels = _user.data().Angels;

    let users = await firebase.firestore().collection("Users").get();

    // Compare Each one's Distance With User's

    const currentUser = users.docs.find(
      (user) => user.id === firebase.auth().currentUser.uid
    );

    for (const angel of angels) {
      users = users.docs.filter(
        (user) =>
          user.id !== angel && user.id !== firebase.auth().currentUser.uid
      );
    }

    const nearbyUsers = users.filter((user) => {
      const distance = DistanceCalculator.calculateDistanceBetweenTwoPoints(
        user.data().location.latitude,
        currentUser.data().location.latitude,
        user.data().location.longitude,
        currentUser.data().location.longitude,
        "M"
      );

      return distance <= 20;
    });

    this.setState({ nearbyUsers });
  };

  getCurrentUser = async () => {
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    this.setState({ currentUser: user.data() });
  };

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        locationResult: `Permission to access location was denied`,
      });
    } else {
      this.setState({ hasLocationPermission: true });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ locationResult: JSON.stringify(location) });
    // Center the map on the location we just fetched.
    this.setState({
      mapRegion: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    });
  };

  async componentDidMount() {
    this.setState({ loading: true });
    await this._getLocationAsync();
    await this.getCurrentUser();
    await this.getPublicAngels();

    this.blinkAnimation();
    this.dangerousAnimation();

    const userID = await firebase.auth().currentUser.uid;

    await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .set(
        {
          location: {
            latitude: this.state.mapRegion.latitude,
            longitude: this.state.mapRegion.longitude,
          },
        },
        { merge: true }
      );

    await this.fetchUsersWhoHaveProblemInTwentyMileRadius();

    this.setState({ loading: false });
  }

  handlePlusButton = async () => {
    this.props.navigation.navigate("History");
  };

  handleSubmit = async () => {
    this.AppendHelpToHistory();

    this.state.currentUser
      ? await firebase
          .firestore()
          .collection("Users")
          .doc(firebase.auth().currentUser.uid)
          .set({ problem: this.state.problem }, { merge: true })
      : null;

    let users = await firebase.firestore().collection("Users").get();

    users = users.docs.filter(
      (user) => user.id !== firebase.auth().currentUser.uid
    );

    if (!users.empty)
      users.map((user) => {
        const distance = DistanceCalculator.calculateDistanceBetweenTwoPoints(
          this.state.mapRegion.latitude,
          user.data().location.latitude,
          this.state.mapRegion.longitude,
          user.data().location.longitude
        );

        if (distance <= 20) {
          // alert(`${angel.data().username} will get a notification`);
          let response = fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: user.data().token,
              sound: "default",
              title: `${
                this.state.currentUser
                  ? this.state.currentUser.username
                  : "User"
              } From Black Angel`,
              body: `${this.state.problem}`,
            }),
          });
        }
        this.setState({ modalVisible: false });
      });

    Alert.alert(
      `A Notification Your Angels and Other Nearby Users Have Been Sent!`
    );
  };

  markSafePrompt = (id) => {
    this.setState({ boxVisibility: true, currentAngel: id });
  };

  markSafe = async () => {
    const { currentAngel } = this.state;

    await firebase
      .firestore()
      .collection("Users")
      .doc(currentAngel)
      .set({ problem: "" }, { merge: true });

    this.setState({ problem: null, currentAngel: null, boxVisibility: false });

    const response = StackActions.replace("Home");
    this.props.navigation.dispatch(response);
  };

  markSelfSafe = async () => {
    await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .set({ problem: "" }, { merge: true });

    const action = StackActions.replace("Home");
    this.props.navigation.dispatch(action);
  };

  userMarkAsSafePrompt = () => {
    Alert.alert(
      "Mark Safe",
      "Are You Sure You Want To Mark Yourself as Safe?",
      [
        {
          text: "Yes",
          onPress: this.markSelfSafe,
          style: "default",
        },
        {
          text: "No",
          onPress: () => console.log(`Action Cancelled`),
          style: "cancel",
        },
      ]
    );
  };

  render() {
    const circleIntropolate = this.state.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.8],
    });

    const dangerous_ColorBlink = this.state.d_animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1.15],
    });

    const DangerousBlink = {
      opacity: this.state.d_animation,
      transform: [
        {
          scale: dangerous_ColorBlink,
        },
      ],
    };

    const BlinkStyle = {
      opacity: this.state.animation,
      transform: [
        {
          scale: circleIntropolate,
        },
      ],
    };

    return (
      <View style={styles.container}>
        <Header navigation={this.props.navigation} />

        <MessageBOX
          problem="Press 'Mark Safe' if the user is out of danger!"
          visibility={this.state.boxVisibility}
          onPress={this.markSafe}
          username="What's The Condition Now?"
        />

        <Prompt
          onSubmit={this.handleSubmit}
          visibility={this.state.modalVisible}
          onChangeText={(text) => this.setState({ problem: text })}
        />

        {this.state.loading ? <Loading /> : null}

        <MapView
          initialRegion={this.state.mapRegion}
          mapType="standard"
          showsBuildings={true}
          showsMyLocationButton={true}
          showsTraffic={true}
          userLocationAnnotationTitle={
            this.state.problem
              ? this.state.problem
              : this.state.currentUser
              ? this.state.currentUser.username
              : "Loading..."
          }
          style={styles.mapView}
        >
          {this.state.publicAngels
            ? this.state.publicAngels.map((angel) => (
                <Marker
                  coordinate={{
                    longitude: angel.data().location.longitude,
                    latitude: angel.data().location.latitude,
                  }}
                  title={angel.data().username}
                  description={angel.data().phoneNumber}
                  onPress={() =>
                    angel.data().problem ? this.markSafePrompt(angel.id) : null
                  }
                >
                  <View>
                    <Animated.View
                      style={[
                        styles.userLocationMarker,
                        angel.data().problem ? DangerousBlink : BlinkStyle,
                      ]}
                    >
                      <View style={styles.userLoactionMarkerBorder} />
                      <View
                        style={[
                          styles.userLocationMarkerCore,
                          {
                            backgroundColor: angel.data().problem
                              ? "red"
                              : colors.angel,
                          },
                        ]}
                      />
                    </Animated.View>
                    {angel.data().problem ? (
                      <View style={[styles.textContainer, { marginLeft: -70 }]}>
                        <Text style={{ color: "white", fontWeight: "600" }}>
                          {angel.data().problem}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Marker>
              ))
            : null}

          {this.state.nearbyUsers
            ? this.state.nearbyUsers.map((user) => (
                <Marker
                  coordinate={{
                    longitude: user.data().location.longitude,
                    latitude: user.data().location.latitude,
                  }}
                  title={user.data().username}
                  description={user.data().phoneNumber}
                >
                  <View>
                    <Animated.View
                      style={[
                        styles.userLocationMarker,
                        user.data().problem ? DangerousBlink : BlinkStyle,
                      ]}
                    >
                      <View style={styles.userLoactionMarkerBorder} />
                      <View
                        style={[
                          styles.userLocationMarkerCore,
                          {
                            backgroundColor: user.data().problem
                              ? "red"
                              : colors.user,
                          },
                        ]}
                      />
                    </Animated.View>
                    {user.data().problem ? (
                      <View style={styles.textContainer}>
                        <Text style={{ color: "white", fontWeight: "600" }}>
                          {user.data().problem}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Marker>
              ))
            : null}

          {this.state.mapRegion ? (
            <Marker
              coordinate={{
                latitude: this.state.mapRegion.latitude,
                longitude: this.state.mapRegion.longitude,
              }}
              title={
                this.state.currentUser
                  ? this.state.currentUser.username
                  : "username"
              }
              description={this.state.problem ? this.state.problem : null}
              onPress={
                this.state.currentUser && this.state.currentUser.problem
                  ? this.userMarkAsSafePrompt
                  : null
              }
            >
              <View style={styles.markerContainer}>
                <Animated.View style={[styles.userLocationMarker, BlinkStyle]}>
                  <View style={styles.userLoactionMarkerBorder} />
                  <View style={[styles.userLocationMarkerCore]} />
                </Animated.View>
                {this.state.currentUser && this.state.currentUser.problem ? (
                  <View style={{}}>
                    <View style={styles.textContainer}>
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        {this.state.currentUser.problem}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={this.userMarkAsSafePrompt}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Mark Safe
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </Marker>
          ) : null}
        </MapView>
        <View style={styles.bottomBar}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.RequestHelp()}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Help</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={this.handlePlusButton}
              style={{
                ...styles.button,
              }}
            >
              <FontAwesome5 name="globe" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("contacts")}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Angels</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    width,
    height,
  },
  mapView: {
    width,
    height,
    margin: 0,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    width: width / 1.05,
    marginHorizontal: 10,
    borderRadius: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 20,
    paddingHorizontal: 5,
    flexDirection: "row",
  },
  buttonContainer: {
    flex: 0.33,
    alignItems: "center",
  },
  button: {
    backgroundColor: colors.background,
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.whiteText,
    fontWeight: "600",
    fontSize: 16,
  },
  userLocationMarker: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
    shadowColor: "#aaa",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.9,
    borderRadius: 50,
  },
  userLoactionMarkerBorder: {
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    borderRadius: 50,
    zIndex: -10,
  },
  userLocationMarkerCore: {
    backgroundColor: colors.primary,
    width: 22,
    position: "absolute",
    top: 3,
    left: 3,
    right: 2,
    bottom: 2,
    height: 22,
    borderRadius: 50,
    zIndex: 10,
  },
  textContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    maxWidth: 200,
    minWidth: 150,
    padding: 4,
    // marginLeft: -70,
    marginVertical: 2,
    borderRadius: 10,
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "rgba(50,130,200,0.7)",
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  markerContainer: {
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Home;
