import React, { useState, useEffect, Component } from "react";
import {
  createDrawerNavigator,
  DrawerItem,
  DrawerItemList
} from "@react-navigation/drawer";
import AppStack from "./AppStack";
import { Dimensions, View, Text, StyleSheet } from "react-native";
import { Content } from "../components";

const { width } = Dimensions.get("screen");

const { Navigator, Screen } = createDrawerNavigator();

export const Drawer = ({}) => (
  <Navigator
    drawerContent={(props) => <Content {...props} />}
    drawerStyle={{
      width: width / 1.3
    }}
    initialRouteName="AppStack"
  >
    <Screen name="AppStack" component={AppStack} />
  </Navigator>
);
