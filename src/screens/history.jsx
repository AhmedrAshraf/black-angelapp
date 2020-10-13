import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions, Alert } from "react-native";
import { Header, HistoryCard } from "../components";
import firebase, { firestore } from "firebase";
import { colors } from "../constants/theme";
import { FlatList, TouchableHighlight } from "react-native-gesture-handler";
import { Loading } from "../components/loading";
const { width, height } = Dimensions.get("screen");

const History = ({ navigation }) => {
  const [History, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistoryAsync = async () => {
    setLoading(true);

    let users = await firestore().collection("Users").get();

    firebase
      .firestore()
      .collection("History")
      .doc("helpHistory")
      .onSnapshot((History) => {
        const history = History.data().history;

        let _history = [];

        history.map((problem) => {
          let user = users.docs.find((user) => user.id == problem.user);
          let prob = { ...problem, username: user.data().username };
          _history = [..._history, prob];
        });
        setHistory(_history);
        setLoading(false);
      });

    // const History = await firebase
    //   .firestore()
    //   .collection("History")
    //   .doc("helpHistory")
    //   .get();

    // History = History.data().history;

    // find the username
  };

  useEffect(() => {
    (async () => {
      fetchHistoryAsync();
    })();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Header navigation={navigation} />
      <Text style={styles.headerText}>History</Text>
      <View style={styles.container}>
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            style={{ marginTop: 15 }}
            data={History}
            renderItem={({ item }) => (
              <HistoryCard
                name={item.username}
                timestamp={item.timestamp}
                problem={item.problem}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width,
    height,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    color: colors.whiteText,
    fontSize: 30,
    textTransform: "uppercase",
    fontWeight: "600",
    textAlign: "center"
  }
});
