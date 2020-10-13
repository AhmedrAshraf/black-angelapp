import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Dimensions,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Share,
} from "react-native";
import {
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native-gesture-handler";
import { colors } from "../constants/theme";
import firebase from "firebase";
import { Loading } from "../components/loading";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as _contacts from "expo-contacts";

import * as SMS from "expo-sms";
import { Contact } from "../components";
import { Header } from "../components";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("screen");

class Contacts extends Component {
  state = {
    contacts: null,
    loading: false,
    canSendSMS: false,
    searchFilter: null,
    angels: [],
  };

  componentDidMount = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      this.setState({ canSendSMS: true });
    } else {
      console.log(
        `SMS is not available on this Device, Some functionalities might not work properly!`
      );
    }

    this.setState({ loading: true });

    this.fetchAngelsAndContacts();
  };

  fetchAngelsAndContacts = async () => {
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .get();

    const Angels = user.data().Angels ? user.data().Angels : null;

    for (let i = 0; i < Angels.length; i++) {
      const user = await firebase
        .firestore()
        .collection("Users")
        .doc(Angels[i])
        .get();

      this.setState({ angels: [...this.state.angels, user.data()] });
    }

    this.setState({
      contacts: [...this.state.angels],
      loading: false,
    });
  };

  handleAdd = async () => {
    const userID = firebase.auth().currentUser.uid;
    const user = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();

    const userUID = user.data().UID ? user.data().UID : null;

    if (userUID) Share.share({ url: userUID, message: `${userUID}` });
    else Alert.alert(`User does not have a uid`);
  };

  sendSMSAsync = async (phone, message) => {
    const { result } = await SMS.sendSMSAsync([phone], message);
    alert(result);
  };

  handleSearch = (text) => {
    const { angels } = this.state;

    const findContacts = angels.filter((contact) =>
      contact.name
        ? contact.name.includes(text)
        : contact.username.includes(text)
    );

    this.setState({ contacts: findContacts });
  };

  render() {
    return (
      <View style={{ ...styles.container, width, height }}>
        <StatusBar style="light" />
        <Header navigation={this.props.navigation} />
        <View>
          {/* <View
            style={{
              width,
              padding: 10,
              marginVertical: 20,
              flexDirection: "row"
            }}
          >
            <View style={{ flex: 0.1 }}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Entypo color={colors.primary} name="chevron-left" size={26} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.title}>ANGELS</Text>
            </View>
          </View> */}
          {this.state.loading ? <Loading /> : <View />}
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.searchInput,
                { flex: 0.9, alignItems: "center", marginLeft: 20 },
              ]}
            >
              <View style={{ flex: 0.1 }}>
                <FontAwesome
                  style={{ padding: 10, color: colors.placeholderColor }}
                  name="search"
                  size={18}
                />
              </View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View>
                  <TextInput
                    onChangeText={(text) => this.handleSearch(text)}
                    placeholderTextColor={colors.placeholderColor}
                    placeholder="Search"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("AddContact")}
                style={{ backgroundColor: "transparent" }}
              >
                <FontAwesome
                  style={{ color: colors.primary }}
                  name="plus"
                  size={26}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={this.handleAdd}
                style={{ backgroundColor: "transparent" }}
              >
                <Feather
                  style={{ color: colors.primary }}
                  name="share"
                  size={26}
                />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={this.state.contacts}
            renderItem={({ item }) => (
              <Contact
                name={item.name || item.username}
                phoneNumber={item.phoneNumber}
                item={item}
              />
            )}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },

  title: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: colors.secondaryBackground,
    width: width / 1.1,
    padding: 5,
    flexDirection: "row",
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: 6,
  },
  input: {
    padding: 10,
    fontSize: 16,
    color: colors.whiteText,
  },
});

export default Contacts;
