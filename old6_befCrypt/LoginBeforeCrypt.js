//import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, StatusBar } from "react-native";

export default function Login() {
	//Use stack ?
	return (
		<View style={styles.container}>
			<Text>Login page</Text>
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
