import React from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import { colors } from "../constants/theme";

export const Loading = () => (
  <ActivityIndicator color={colors.primary} size="large" />
);
