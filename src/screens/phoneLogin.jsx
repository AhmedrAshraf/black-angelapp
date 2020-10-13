import * as React from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import * as firebase from "firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";

const { width, height } = Dimensions.get("screen");

const firebaseConfig = {
  apiKey: "AIzaSyBzgOgR_5oscEehqsjRyM5W6ZRSvxoGmTY",
  authDomain: "blackangel-f7c41.firebaseapp.com",
  databaseURL: "https://blackangel-f7c41.firebaseio.com",
  projectId: "blackangel-f7c41",
  storageBucket: "blackangel-f7c41.appspot.com",
  messagingSenderId: "102407084060",
  appId: "1:102407084060:web:3a1995e9f45b45d04027d9"
};

function App(props) {
  const recaptchaVerifier = React.useRef(null);
  const [phoneNumber, setPhoneNumber] = React.useState();
  const [verificationId, setVerificationId] = React.useState();
  const [verificationCode, setVerificationCode] = React.useState();
  const [message, showMessage] = React.useState(
    !firebaseConfig || Platform.OS === "web"
      ? {
          text:
            "To get started, provide a valid firebase config in App.js and open this snack on an iOS or Android device."
        }
      : undefined
  );

  const savePhoneNumberToFireStoreAsync = async (userID) => {
    await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .set({ phoneNumber: phoneNumber }, { merge: true })
      .catch((err) => {
        throw err;
      });
  };

  return (
    <View style={{ width, height, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView>
        <View style={{ margin: 20 }}>
          <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={firebaseConfig}
          />
          <Text style={{ marginTop: 20, color: colors.whiteText }}>
            Enter phone number
          </Text>
          <TextInput
            style={{
              marginVertical: 10,
              fontSize: 17,
              color: colors.whiteText
            }}
            placeholder="999 999 9999"
            placeholderTextColor={colors.placeholderColor}
            autoFocus
            autoCompleteType="tel"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            maxLength={13}
            onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
          />
          <Button
            title="Send Verification Code"
            disabled={!phoneNumber}
            onPress={async () => {
              console.log(phoneNumber);
              let number = "+1" + phoneNumber.toString();
              try {
                const phoneProvider = new firebase.auth.PhoneAuthProvider();
                const verificationId = await phoneProvider.verifyPhoneNumber(
                  number,
                  recaptchaVerifier.current
                );
                setVerificationId(verificationId).then((res) => {
                  console.log(res);
                  // var user = .currentUser.uid;
                  // const db = firebase.firestore();
                  // db.collection("Users").doc(user).set({
                  //     Score: 0,
                  // });
                  db.collection("Users")
                    .doc(user)
                    .get()
                    .then(function (doc) {
                      let that = this;
                      if (doc.exists) {
                      } else {
                      }
                    })
                    .catch(function (error) {
                      console.log("Error getting document:", error);
                    });
                });
                alert("Verification code has been sent to your phone.");
              } catch (err) {
                console.log(err);
                // showMessage({ text: `Error: ${err.message}`, color: "red" });
              }
            }}
          />
          <Text style={{ marginTop: 20, color: colors.whiteText }}>
            Enter Verification code
          </Text>
          <TextInput
            style={{
              marginVertical: 10,
              fontSize: 17,
              color: colors.whiteText
            }}
            editable={!!verificationId}
            placeholder="123456"
            placeholderTextColor={colors.placeholderColor}
            onChangeText={setVerificationCode}
          />
          <Button
            title="Confirm Verification Code"
            disabled={!verificationId}
            onPress={async () => {
              try {
                const credential = firebase.auth.PhoneAuthProvider.credential(
                  verificationId,
                  verificationCode
                );
                await firebase.auth().signInWithCredential(credential);

                const userID = firebase.auth().currentUser.uid;

                await savePhoneNumberToFireStoreAsync(userID);

                showMessage({ text: "Phone authentication successful 👍" });
                // props.navigation.navigate("UsernameUpdate")
              } catch (err) {
                showMessage({ text: `Error: ${err.message}`, color: "red" });
              }
            }}
          />
          {message ? (
            <TouchableOpacity
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 0xffffffee, justifyContent: "center" }
              ]}
              onPress={() => showMessage(undefined)}
            >
              <Text
                style={{
                  color: message.color || "blue",
                  fontSize: 17,
                  textAlign: "center",
                  margin: 20
                }}
              >
                {message.text}
              </Text>
            </TouchableOpacity>
          ) : undefined}
        </View>
      </SafeAreaView>
    </View>
  );
}

export default App;
