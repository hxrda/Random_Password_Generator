import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	View,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { TextInput, Text, Button, Modal, Portal } from "react-native-paper";

import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";

import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

///// COMPONENT /////
export default function Login({
	setIsSignedIn,
	setUserId,
	setUserEmail,
	auth,
}) {
	//--States--//
	const [emailLogin, setEmailLogin] = useState("");
	const [passwordLogin, setPasswordLogin] = useState("");

	const [modalVisible, setModalVisible] = useState(false);
	const [showPasswordLogin, setShowPasswordLogin] = useState(false);
	const [showPasswordRegister, setShowPasswordRegister] = useState(false);

	//--Functions--//
	//Login:
	const handleLogin = () => {
		signInWithEmailAndPassword(auth, emailLogin, passwordLogin)
			.then((userCredential) => {
				// Successful login
				const user = userCredential.user;
				const userEmail = user.email;

				setUserId(user.uid);
				setUserEmail(userEmail);
				setIsSignedIn(true);
			})
			.catch((error) => {
				// Handle login error
				console.error("Invalid email or password");

				/*
				const errorCode = error.code;
				const errorMessage = error.message;
				console.error("Error signing in:", errorCode, errorMessage);
				*/
			});
	};

	//Registration:
	const handleRegister = async () => {
		try {
			// Successful registration
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				emailLogin,
				passwordLogin
			);
			const user = userCredential.user;
			const userEmail = user.email;

			// Generate and save keys for the new registered users
			await generateKeys(user.uid);

			setUserId(user.uid);
			setUserEmail(userEmail);

			setIsSignedIn(true);
			setModalVisible(false);
		} catch (error) {
			//Handle registration error:
			console.error("Invalid email address");

			/*
			const errorCode = error.code;
			const errorMessage = error.message;
			console.error("Error in registration:", errorCode, errorMessage);
			*/
		}
	};

	//Generate a key:
	const generateKeys = async (userId) => {
		try {
			const secretKey = Crypto.randomUUID();

			// Store the key associated with user ID:
			await SecureStore.setItemAsync(`secretKey_${userId}`, secretKey);

			console.log(
				"Secret key generated and saved successfully for user:",
				userId
			);
		} catch (error) {
			console.error("Error generating and saving a secret key:", error);
		}
	};

	//Handle modal:
	const hideModal = () => setModalVisible(false);
	const showModal = () => {
		console.log("Modal pressed");

		setModalVisible(true);
	};

	const containerStyle = {
		backgroundColor: "white",
		padding: 20,
		marginLeft: 10,
		marginRight: 10,
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={styles.container}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
		>
			<ScrollView
				style={styles.container}
				contentContainerStyle={{
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Image
					style={{ marginTop: 90, marginBottom: 10, width: 250, height: 300 }}
					source={require("../logos/logo.png")}
				/>
				<Text variant="titleMedium" style={{ fontFamily: "monospace" }}>
					Random password generator
				</Text>

				<View style={{ marginTop: 20 }}></View>

				<View>
					<TextInput
						style={styles.textInputField}
						mode="outlined"
						label="Email"
						value={emailLogin}
						onChangeText={(text) => setEmailLogin(text)}
						theme={{ roundness: 100 }}
						contentStyle={{ width: 280 }}
						autoCapitalize="none"
					/>

					<View style={{ marginBottom: 10 }}></View>

					<TextInput
						style={styles.textInputField}
						mode="outlined"
						label="Password"
						value={passwordLogin}
						onChangeText={(text) => setPasswordLogin(text)}
						theme={{ roundness: 100 }}
						autoCapitalize="none"
						secureTextEntry={!showPasswordLogin}
						right={
							<TextInput.Icon
								icon={showPasswordLogin ? "eye-off" : "eye"}
								onPress={() => setShowPasswordLogin(!showPasswordLogin)}
							/>
						}
					/>
				</View>

				<View style={{ marginTop: 40 }}></View>

				<Button
					mode="contained"
					onPress={handleLogin}
					buttonColor="#58184f"
					contentStyle={{ width: 130 }}
				>
					LOGIN
				</Button>

				<Button
					mode="text"
					onPress={showModal}
					textColor="#411858"
					rippleColor="#fff"
				>
					Register here
				</Button>

				<View style={{ marginTop: 120 }}></View>

				<Portal>
					<Modal
						visible={modalVisible}
						onDismiss={hideModal}
						contentContainerStyle={containerStyle}
					>
						<View style={styles.modalContainer}>
							<Text style={{ fontSize: 18, marginBottom: 20 }}>Sign Up</Text>
							<TextInput
								style={[styles.textInputField, { marginBottom: 10 }]}
								mode="outlined"
								label="Email"
								value={emailLogin}
								onChangeText={(text) => setEmailLogin(text)}
								autoCapitalize="none"
							/>
							<TextInput
								style={[styles.textInputField, { marginBottom: 25 }]}
								mode="outlined"
								label="Password"
								value={passwordLogin}
								onChangeText={(text) => setPasswordLogin(text)}
								secureTextEntry={!showPasswordRegister}
								autoCapitalize="none"
								right={
									<TextInput.Icon
										icon={showPasswordRegister ? "eye-off" : "eye"}
										onPress={() =>
											setShowPasswordRegister(!showPasswordRegister)
										}
									/>
								}
							/>
							<Button
								mode="contained"
								onPress={handleRegister}
								buttonColor="#58184f"
							>
								REGISTER
							</Button>
						</View>
					</Modal>
				</Portal>

				<StatusBar style="auto" />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
	},
	textInputField: {
		backgroundColor: "#f9f9fb",
	},
	modalContainer: {},
});
