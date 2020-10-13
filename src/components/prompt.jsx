import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, Animated } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../constants/theme";

const { width, height } = Dimensions.get("screen");

export const Prompt = ({ placeholder, visibility, onChangeText, onSubmit }) => {
  const [animation] = useState(new Animated.Value(0));

  const animateComponent = () =>
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start();

  const reAnimateComponent = (num) =>
    Animated.timing(animation, {
      toValue: 0,
      duration: 500
    }).start();

  useEffect(() => (visibility ? animateComponent() : reAnimateComponent()));

  const alignmentIntropolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, height / 2 - 100]
  });

  const dynamicStyle = {
    top: alignmentIntropolate
  };

  return (
    <Animated.View style={[styles.container, dynamicStyle]}>
      <View style={styles.closeBtn}>
        <TouchableOpacity
          onPress={() => reAnimateComponent(1)}
          style={{
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: 50,
            width: 26,
            height: 26,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600" }}>×</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>What's Wrong?</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholderTextColor="#555"
          style={styles.input}
          onChangeText={onChangeText}
          placeholder={placeholder || "Please Describe Your Problem"}
        />
      </View>
      <View style={{ width: "100%", alignItems: "center", paddingVertical: 20 }}>
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text
            style={{ fontSize: 18, color: colors.whiteText, fontWeight: "600" }}
          >
            Submit
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 1000,
    padding: 20,
    position: "absolute",
    left: width / 20,
    right: width / 20,
    width: width / 1.1,
    shadowColor: "#aaa",
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    borderRadius: 10
  },
  inputContainer: {
    width: "100%",
    padding: 10,
    marginVertical: 10
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    padding: 10
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingHorizontal: 40,
    borderRadius: 20
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 5
  }
});
