import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { PhoneLogin } from "../screens";
const { Navigator, Screen } = createStackNavigator();

const AuthStack = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="Login" component={PhoneLogin} />
  </Navigator>
);

export default AuthStack;
