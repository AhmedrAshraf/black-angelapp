import React from "react";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Dimensions, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";
import { TouchableOpacity } from "react-native-gesture-handler";
import firebase from "firebase";
import { StackActions } from "@react-navigation/native";

const { width } = Dimensions.get("screen");

const Header = ({ navigation }) => {
  const handleHelp = () => {
    Alert.alert(`Help Manual Will Be Added Soon...`);
  };

  const refreshHome = () => {
    const action = StackActions.replace("Home");
    navigation.dispatch(action);
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.iconView}>
          <View
            style={{
              flex: 0.5,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Entypo
                name="dots-three-horizontal"
                color={colors.whiteText}
                size={26}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 0.5,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <TouchableOpacity onPress={refreshHome}>
              <Entypo name="location" color={colors.whiteText} size={26} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.textView}>
          <Text style={styles.normalText}>Track Protect</Text>
          <Text style={styles.smallText}>Stay Safe & Protect</Text>
        </View>
        <View style={styles.rightIcons}>
          <View style={styles.helpIcon}>
            <TouchableOpacity onPress={() => handleHelp()}>
              <Ionicons
                name="md-help-circle-outline"
                color={colors.whiteText}
                size={26}
              />
            </TouchableOpacity>
          </View>
          {/* <View style={styles.exitIcon}>
            <TouchableOpacity onPress={() => firebase.auth().signOut()}>
              <Ionicons name="md-exit" color={colors.whiteText} size={26} />
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    width,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowColor: "#555",
    shadowOpacity: 0.7,
    marginVertical: 0
  },
  rightIcons: {
    flex: 0.2,
    flexDirection: "row",
    marginHorizontal: 3
  },
  iconView: {
    flex: 0.4,
    marginHorizontal: 3,
    flexDirection: "row"
  },
  textView: {
    flex: 0.5,
    marginHorizontal: 20
  },
  smallText: {
    color: colors.whiteText,
    fontSize: 11
  },
  normalText: {
    color: colors.whiteText,
    fontSize: 16,
    fontWeight: "600"
  },
  helpIcon: {
    marginHorizontal: 10,
    flex: 1,
    alignItems: "center"
  },
  exitIcon: {
    marginHorizontal: 10,
    flex: 0.5,
    alignItems: "center"
  }
});

export default Header;
