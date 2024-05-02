import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	View,
	Image,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
} from "react-native"; //Text removed
//import { Image } from "@rneui/themed";
import {
	TextInput,
	Text,
	Button,
	PaperProvider,
	Modal,
	Portal,
} from "react-native-paper";

export default function App() {
	//--States--//
	const [emailLogin, setEmailLogin] = useState("");
	const [passwordLogin, setPasswordLogin] = useState("");

	const [modalVisible, setModalVisible] = useState(false);
	const [showPasswordLogin, setShowPasswordLogin] = useState(false);
	const [showPasswordRegister, setShowPasswordRegister] = useState(false);

	//--Functions--//

	//Login:
	const handleLogin = () => {
		//Empty input field states:
		console.log("Login button pressed");
		setEmailLogin("");
		setPasswordLogin("");
	};

	//Register:
	const handleRegister = () => {
		// Perform registration logic
		console.log("Register button pressed");
		setModalVisible(false); // Close the modal after registration
		//setEmailLogin("");
		//setPasswordLogin("");
	};

	//Handle modal:
	const hideModal = () => setModalVisible(false);
	const showModal = () => {
		console.log("Modal pressed");
		//setShowPassword(!showPassword);
		setModalVisible(true);
	};

	const containerStyle = {
		backgroundColor: "white",
		padding: 20,
		marginLeft: 10,
		marginRight: 10,
	};

	//<KeyboardAvoidingView behavior="height">

	//--Rendering--//
	return (
		<PaperProvider>
			<KeyboardAvoidingView behavior="position">
				<View style={styles.container}>
					<Image
						style={{ marginTop: 90, marginBottom: 10, width: 250, height: 300 }}
						source={require("./logos/logo.png")}
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
						/>

						<View style={{ marginBottom: 10 }}></View>

						<TextInput
							style={styles.textInputField}
							mode="outlined"
							label="Password"
							value={passwordLogin}
							onChangeText={(text) => setPasswordLogin(text)}
							theme={{ roundness: 100 }}
							secureTextEntry={!showPasswordLogin}
							right={
								<TextInput.Icon
									//icon="eye"
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
						//contentStyle={{ textColor: "#411858" }}
						textColor="#411858"
						rippleColor="#fff"
					>
						Register here
					</Button>

					<Portal>
						<Modal
							visible={modalVisible}
							//transparent={true}
							onDismiss={hideModal}
							contentContainerStyle={containerStyle}
							//onRequestClose={() => setModalVisible(false)}
						>
							<View style={styles.modalContainer}>
								<Text style={{ fontSize: 18, marginBottom: 20 }}>Sign Up</Text>
								<TextInput
									style={[styles.textInputField, { marginBottom: 10 }]}
									mode="outlined"
									label="Email"
									value={emailLogin}
									onChangeText={(text) => setEmailLogin(text)}
								/>
								<TextInput
									style={[styles.textInputField, { marginBottom: 25 }]}
									mode="outlined"
									label="Password"
									value={passwordLogin}
									onChangeText={(text) => setPasswordLogin(text)}
									secureTextEntry={!showPasswordRegister}
									right={
										<TextInput.Icon
											//icon="eye"
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
									//contentStyle={{ width: 130 }}
								>
									REGISTER
								</Button>
							</View>
						</Modal>
					</Portal>

					<StatusBar style="auto" />
				</View>
			</KeyboardAvoidingView>
		</PaperProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		//flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	textInputField: {
		//width: 280,
		//borderRadius: 40,
		//marginTop: 10,
		backgroundColor: "#f9f9fb",
		//marginBottom: 10,
	},
	modalContainer: {
		//width: "80%",
	},
});

//<Text style={{ color: "#411858" }}>Register here</Text>
