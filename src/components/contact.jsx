import React from "react";

import { View, Text, StyleSheet, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../constants/theme";

const { width, height } = Dimensions.get("screen");

export const Contact = ({ id, name, phoneNumber, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.contactCard}>
      <View style={{ flex: 1, alignItems: "flex-start" }}>
        <Text
          style={{
            color: colors.whiteText,
            paddingVertical: 5,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          {"   " + name}
        </Text>
      </View>
      <View style={{ flex: 0.5, alignItems: "center" }}>
        <Text
          style={{
            color: colors.placeholderColor,
            paddingVertical: 5,
            fontSize: 13,
          }}
        >
          {phoneNumber ? phoneNumber : "No Phone Number Available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contactCard: {
    backgroundColor: colors.secondaryBackground,
    flexDirection: "row",
    marginVertical: 15,
    width: width / 1.1,
    padding: 10,
    borderRadius: 6,
    shadowColor: "#333",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.9,
    alignSelf: "center",
  },
});
