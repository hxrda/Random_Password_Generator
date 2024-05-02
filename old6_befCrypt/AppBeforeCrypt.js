import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./components/Home";
import Vault from "./components/Vault";
import Profile from "./components/Profile";

import Ionicons from "react-native-vector-icons/Ionicons";
import { Header, getHeaderTitle } from "@react-navigation/elements";

import { Feather } from "@expo/vector-icons";
//import { Header } from "@rneui/themed";
//black code: #000000
//ORANGE code. #f4511e
// Import the functions you need from the SDKs you need

import {
	API_KEY,
	AUTH_DOMAIN,
	DATABASE_URL,
	PROJECT_ID,
	STORAGE_BUCKET,
	MESSAGING_SENDER_ID,
	APP_ID,
} from "@env";

///////DATABASE/////
import { initializeApp } from "firebase/app";
//import { getDatabase } from "firebase/database";
import {
	getDatabase,
	ref,
	set,
	push,
	onValue,
	remove,
} from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// `

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: `${API_KEY}`,
	authDomain: `${AUTH_DOMAIN}`,
	databaseURL: `${DATABASE_URL}`,
	projectId: `${PROJECT_ID}`,
	storageBucket: `${STORAGE_BUCKET}`,
	messagingSenderId: `${MESSAGING_SENDER_ID}`,
	appId: `${APP_ID}`,
};

// Initialize Firebase (connection to project)
const app = initializeApp(firebaseConfig);
// Create connection to database itself:
const database = getDatabase(app);

const Tab = createBottomTabNavigator(); //Returns nav object containing: Screen & Navigation components

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={({ route }) => ({
					tabBarIcon: ({ focused, color, size }) => {
						let iconName;

						if (route.name === "New") {
							iconName = focused ? "add-circle-outline" : "add-circle-outline";
						} else if (route.name === "Passwords") {
							iconName = focused ? "list" : "list"; //if menu item is focused, it'll be __:, otherwise :___
						} else if (route.name === "Profile") {
							iconName = focused
								? "person-circle-sharp"
								: "person-circle-sharp"; //if menu item is focused, it'll be __:, otherwise :___
						}

						// You can return any component that you like here!
						return <Ionicons name={iconName} size={size} color={color} />; //color="red"
					},
					tabBarActiveTintColor: "#211BBF",
					tabBarInactiveTintColor: "gray",
					headerStyle: {
						backgroundColor: "#000000",
					},
					headerTitleAlign: "center",
					headerTintColor: "#fff",
					headerTitleStyle: {
						//fontWeight: "bold",
						fontSize: 15,
						fontFamily: "sans-serif-medium",
					},
				})}
			>
				<Tab.Screen
					name="New"
					children={() => <Home database={database} />}
					options={{
						headerTitle: "NEW CREDENTIALS",
					}}
				/>
				<Tab.Screen
					name="Passwords"
					children={() => <Vault database={database} />}
					options={{
						headerTitle: "PASSWORD LIST",
					}}
				/>
				<Tab.Screen
					name="Profile"
					component={Profile}
					options={{
						headerTitle: "USER PROFILE",
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});

/*
export default function App() {
	return (
		<View style={styles.container}>
			<Text>Root</Text>
			<StatusBar style="auto" />
		</View>
	);
}
*/
