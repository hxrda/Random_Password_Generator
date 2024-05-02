//import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home";
import Vault from "./components/Vault";
import Profile from "./components/Profile";
import Login from "./components/Login";

import Ionicons from "react-native-vector-icons/Ionicons";
import { Header, getHeaderTitle } from "@react-navigation/elements";
import {
	Switch,
	Snackbar,
	Button,
	Dialog,
	Portal,
	PaperProvider,
} from "react-native-paper";

import { Feather } from "@expo/vector-icons";
//import { Header } from "@rneui/themed";

// Import the functions you need from the SDKs you need
import * as SecureStore from "expo-secure-store";

import {
	API_KEY,
	AUTH_DOMAIN,
	DATABASE_URL,
	PROJECT_ID,
	STORAGE_BUCKET,
	MESSAGING_SENDER_ID,
	APP_ID,
} from "@env";

///// DATABASE /////
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
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// The web app's Firebase configuration
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
// Create connection to Database:
const database = getDatabase(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const Tab = createBottomTabNavigator(); //Returns nav object containing: Screen & Navigation components
const Stack = createNativeStackNavigator();

///// APP /////
export default function App() {
	//--States--//
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [userId, setUserId] = useState(null); // State to hold the user ID

	//--Functions--//

	//--Rendering--//
	return (
		<PaperProvider>
			<NavigationContainer>
				{!isSignedIn ? (
					<Stack.Navigator>
						<Stack.Screen
							name="Login"
							options={{ headerShown: false }}
							//initialParams={{ setIsSignedIn: setIsSignedIn }}
						>
							{(props) => (
								<Login
									{...props}
									setIsSignedIn={setIsSignedIn}
									setUserId={setUserId}
									auth={auth}
								/>
							)}
						</Stack.Screen>
					</Stack.Navigator>
				) : (
					<Tab.Navigator
						screenOptions={({ route }) => ({
							tabBarIcon: ({ focused, color, size }) => {
								let iconName;

								if (route.name === "New") {
									iconName = focused
										? "add-circle-outline"
										: "add-circle-outline";
								} else if (route.name === "Passwords") {
									iconName = focused ? "list" : "list";
								} else if (route.name === "Profile") {
									iconName = focused
										? "person-circle-sharp"
										: "person-circle-sharp";
								}

								// You can return any component that you like here!
								return <Ionicons name={iconName} size={size} color={color} />;
							},
							tabBarActiveTintColor: "#211BBF",
							tabBarInactiveTintColor: "gray",
							headerStyle: {
								backgroundColor: "#000000",
							},
							headerTitleAlign: "center",
							headerTintColor: "#fff",
							headerTitleStyle: {
								fontSize: 15,
								fontFamily: "sans-serif-medium",
							},
						})}
					>
						<Tab.Screen
							name="New"
							children={() => <Home database={database} userId={userId} />}
							options={{
								headerTitle: "NEW CREDENTIALS",
							}}
						/>

						<Tab.Screen
							name="Passwords"
							children={() => <Vault database={database} userId={userId} />}
							options={{
								headerTitle: "PASSWORD LIST",
							}}
						/>

						<Tab.Screen
							name="Profile"
							//component={Profile}
							children={() => <Profile database={database} userId={userId} />}
							options={{
								headerTitle: "USER PROFILE",
							}}
						/>
					</Tab.Navigator>
				)}
			</NavigationContainer>
		</PaperProvider>
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
