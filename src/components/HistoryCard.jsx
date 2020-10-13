import React, { useState, useEffect } from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";

const { width, height } = Dimensions.get("screen");

const History = ({ id, name, problem, timestamp }) => {
  const formatTimeStamp = () => {
    const stamp = new Date(timestamp);

    const _timeStamp = {
      date: `${stamp.getDate()}-${stamp.getMonth() + 1}-${stamp.getFullYear()}`,
      time: `${stamp.getHours()}:${stamp.getMinutes()}:${stamp.getSeconds()}`
    };

    return _timeStamp;
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 0.3 }}>
        <Text
          style={{
            fontWeight: "600",
            color: colors.whiteText,
            fontSize: 16,
            textTransform: "uppercase"
          }}
        >
          {name}
        </Text>
      </View>
      <View style={{ flex: 0.4, justifyContent: "center" }}>
        <Text
          style={{ color: colors.whiteText, fontWeight: "300", marginTop: 3 }}
        >
          {problem}
        </Text>
      </View>
      <View
        style={{ flex: 0.3, flexDirection: "row", justifyContent: "flex-end" }}
      >
        <Text
          style={{ color: colors.whiteText, marginHorizontal: 3, fontSize: 11 }}
        >
          {formatTimeStamp(timestamp).date}
        </Text>
        <Text
          style={{ color: colors.whiteText, marginHorizontal: 3, fontSize: 11 }}
        >
          {formatTimeStamp(timestamp).time}
        </Text>
      </View>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width / 1.05,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.secondaryBackground,
    marginVertical: 10
  }
});
