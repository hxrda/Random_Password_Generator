//import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, StatusBar, Button } from "react-native";

export default function Login({ setIsSignedIn }) {
	//Use stack:
	// Login({ navigation, route, setIsSignedIn }) {

	const handleLogin = () => {
		setIsSignedIn(true); // Simulated successful login
	};

	//handleLogin();

	// Perform authentication logic
	// If authentication is successful:

	/*
	useEffect(() => {
		setIsSignedIn(true);
		navigation.navigate("Home");
	}, [setIsSignedIn]);
	*/

	//Button on press:
	////, navigation.navigate("Home");
	// After successful login, navigate to the home screen

	return (
		<View style={styles.container}>
			<Text>Login page</Text>
			<Button title="Continue" onPress={handleLogin} />
			<StatusBar barStyle="#fff" />
		</View>
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
