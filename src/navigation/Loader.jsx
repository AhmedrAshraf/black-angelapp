import React from "react";
import { View } from "react-native";
import { Loading } from "../components/loading";
import { colors } from "../constants/theme";

const Loader = (props) => (
  <View
    style={{
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <Loading />
  </View>
);

export default Loader;
