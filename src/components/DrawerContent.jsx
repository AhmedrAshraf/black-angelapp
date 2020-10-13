import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";
import { Loading } from "./loading";
import { connect } from "react-redux";

const { width, height } = Dimensions.get("screen");

const Content = (props) => {
  return (
    <View style={styles.container}>
      {props.user ? (
        <View
          style={{
            flex: 0.8,
            width: "100%",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingVertical: "20%"
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: "600",
              marginVertical: 20
            }}
          >
            {props.user.username}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginVertical: 20
            }}
          >
            {props.user.phoneNumber}
          </Text>
          <View
            style={{
              borderColor: "white",
              borderWidth: 2,
              width: 100,
              height: 100,
              marginVertical: 20,
              borderRadius: 50,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text
              style={{
                color: "white",
                marginVertical: 10,
                fontSize: 18,
                fontWeight: "600"
              }}
            >
              {props.user.UID}
            </Text>
          </View>
        </View>
      ) : (
        <Loading />
      )}
      <View style={styles.offset} />
      {/* <View style={styles.content}>
        <TouchableOpacity
          onPress={() => props.navigation.navigate("History")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => firebase.auth().signOut()}
          style={{ ...styles.button, backgroundColor: "red" }}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStateToProps = (state) => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) => ({});

const connectComponent = connect(mapStateToProps, mapDispatchToProps);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#222222"
  },
  content: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingHorizontal: width / 5,
    borderRadius: 20
  },
  buttonText: {
    color: colors.whiteText,
    fontSize: 18,
    fontWeight: "600"
  }
});

export default connectComponent(Content);
