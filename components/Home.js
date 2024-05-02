//Home component is initially rendered:
import React, { useState, useEffect } from "react";
//import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	View,
	ScrollView,
	FlatList,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from "react-native";

import { Input, Text, Icon, ListItem } from "@rneui/themed"; //Button for old buttons
import {
	Switch,
	Snackbar,
	Button,
	Dialog,
	Portal,
	PaperProvider,
} from "react-native-paper";
import Slider from "@react-native-community/slider";

//import { Header } from "@rneui/themed";

//OG status bar: <StatusBar style="auto" />

//import { RSAKey } from "react-native-rsa";
import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";

import {
	getDatabase,
	ref,
	set,
	push,
	onValue,
	remove,
} from "firebase/database";

import { API_URL } from "@env";

export default function Home({ database, userId }) {
	//--States--//
	//Credentials
	const [record, setRecord] = useState({
		provider: "",
		userId: "",
		cryptedPassword: "",
		dateCreated: "",
	});

	//const [provider, setProvider] = React.useState("");
	//const [userId, setUserId] = React.useState("");
	const [generatedPassword, setGeneratedPassword] = React.useState("");
	//const [cryptedPassword, setCryptedPassword] = React.useState("");

	//Switches
	//const [isSwitch1On, setIsSwitch1On] = React.useState(false);
	//const [isSwitch2On, setIsSwitch2On] = React.useState(false);

	const [isUpperCaseSwitchOn, setUpperCaseSwitchOn] = React.useState(false);
	const [isLowerCaseSwitchOn, setLowerCaseSwitchOn] = React.useState(false);
	const [isNumbersSwitchOn, setNumbersSwitchOn] = React.useState(false);
	const [isSpecialsSwitchOn, setSpecialsSwitchOn] = React.useState(false);

	//Fetch Parameters:
	const [upper, setUpper] = React.useState("off");
	const [lower, setLower] = React.useState("off");
	const [numbers, setNumbers] = React.useState("off");
	const [special, setSpecial] = React.useState("off");

	//Slider:
	const [sliderValue, setSliderValue] = React.useState(1);

	//Snackbar:
	const [snackbarVisible, setSnackbarVisible] = React.useState(false);

	//Dialog for password:
	const [dialogVisible, setDialogVisible] = React.useState(false);
	const dialogAlert =
		"There is no content chosen for the password.\n\nPlease turn at least one of the switches on and try again.";

	//Dialog for save:
	const [saveDialogVisible, setSaveDialogVisible] = React.useState(false);
	const dialogSaveAlert = "Please generate a password first.";

	//Check that data for saving ok:
	const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);

	//Additionals:
	const [focusedInput, setFocusedInput] = useState(null);

	//--Testing state updates--//
	// Add useEffect hook to log the 'upper' state after every update
	useEffect(() => {
		console.log("----NEW UPDATE ----");
		console.log("isUpperCaseSwitchOn:", { isUpperCaseSwitchOn });
		console.log("upper:", { upper });

		console.log("isLowerCaseSwitchOn:", { isLowerCaseSwitchOn });
		console.log("lower:", { lower });

		console.log("isNumbersSwitchOn:", { isNumbersSwitchOn });
		console.log("numbers::", { numbers });

		console.log("isSpecialsSwitchOn:", { isSpecialsSwitchOn });
		console.log("special:", { special });

		console.log("Generated pwd: ", { generatedPassword });
		console.log(
			"Record:",
			record.provider,
			record.userId,
			generatedPassword,
			//record.cryptedPassword,
			record.dateCreated
		);
	}, [
		isUpperCaseSwitchOn,
		upper,
		isLowerCaseSwitchOn,
		lower,
		isNumbersSwitchOn,
		numbers,
		isSpecialsSwitchOn,
		special,
		generatedPassword,
		record,
	]);

	//--Functions--//

	//useEffect for date:
	useEffect(() => {
		if (record.cryptedPassword) {
			const currentDate = new Date();
			const dateString = currentDate.toISOString();
			console.log("date string:", dateString);

			setRecord({ ...record, dateCreated: dateString });
		}
	}, [record.cryptedPassword]);

	//Handle snackbar:
	const onToggleSnackBar = () => setSnackbarVisible(!snackbarVisible);
	const onDismissSnackBar = () => setSnackbarVisible(false);

	//Handle switch toggle:
	const onToggleSwitch = (switchId) => {
		if (switchId === 1) {
			setUpperCaseSwitchOn((prevState) => {
				const newState = !prevState;

				setUpper(newState ? "on" : "off");
				return newState;
			});
		} else if (switchId === 2) {
			setLowerCaseSwitchOn((prevState) => {
				const newState = !prevState;
				setLower(newState ? "on" : "off");
				return newState;
			});
		} else if (switchId === 3) {
			setNumbersSwitchOn((prevState) => {
				const newState = !prevState;
				setNumbers(newState ? "on" : "off");
				return newState;
			});
		} else if (switchId === 4) {
			setSpecialsSwitchOn((prevState) => {
				const newState = !prevState;
				setSpecial(newState ? "on" : "off");
				return newState;
			});
		}
	};

	//Handle dialogs:
	const showDialog = () => setDialogVisible(true);
	const hideDialog = () => setDialogVisible(false);

	const showSaveDialog = () => setSaveDialogVisible(true);
	const hideSaveDialog = () => setSaveDialogVisible(false);

	//Fetch API:
	const generatePassword = () => {
		// Check if at least one selection is on
		if (
			!isUpperCaseSwitchOn &&
			!isLowerCaseSwitchOn &&
			!isNumbersSwitchOn &&
			!isSpecialsSwitchOn
		) {
			// If no selection is on, display an alert:
			showDialog();

			return; // Exit without proceeding to fetch.
		}

		//If at least 1 selection is on, proceed to fetch:
		fetch(
			`${API_URL}?length=${sliderValue}&upper=${upper}&lower=${lower}&numbers=${numbers}&special=${special}&exclude=&repeat=1`
		)
			.then((response) => {
				if (!response.ok)
					throw new Error("Error in fetch: " + response.statusText);
				return response.json();
			})
			.then(async (data) => {
				const generatorResult = data[0].password;
				setGeneratedPassword(generatorResult);
				setIsPasswordGenerated(true);

				try {
					//Fetch public key & Handle crypting:
					const secretKey = await SecureStore.getItemAsync(
						`secretKey_${userId}`
					);
					if (!secretKey) {
						console.error("Public key not found for user, Encryption:", userId);
						return;
					}

					/*
				const publicKey = await SecureStore.getItemAsync(`publicKey_${userId}`);
				if (!publicKey) {
					console.error("Public key not found for user:", userId);
					return;
				}
				*/

					//Encrypt generated password:
					//var CryptoJS = require("crypto-js");
					const encryptedPassword = CryptoJS.AES.encrypt(
						generatorResult,
						secretKey // Use a secure key for encryption
					).toString();

					/*
				const rsa = new RSAKey();
				rsa.setPublicString(publicKey);

				const encryptedPassword = rsa.encrypt(generatorResult);
				*/

					//Update record with encrypted password:
					setRecord((prevRecord) => ({
						...prevRecord,
						cryptedPassword: encryptedPassword,
					}));
				} catch (error) {
					console.error("Error retrieving secretKey:", error);
				}
				//
			})

			.catch((err) => console.error(err));
	};

	//Save data to Database:
	const handleSave = async () => {
		if (!isPasswordGenerated) {
			// If password is not generated, show dialog and return
			showSaveDialog();
			return;
		}

		push(ref(database, `/records/${userId}`), record);

		//Snackbar response:
		onToggleSnackBar();

		//Empty the states:
		setRecord({
			provider: "",
			userId: "",
			cryptedPassword: "",
			dateCreated: "",
		});
		setGeneratedPassword("");
		setIsPasswordGenerated(false);
		setUpperCaseSwitchOn(false);
		setLowerCaseSwitchOn(false);
		setNumbersSwitchOn(false);
		setSpecialsSwitchOn(false);
		setUpper("off");
		setLower("off");
		setNumbers("off");
		setSpecial("off");
	};

	const keyboardVerticalOffset = focusedInput ? 0 : 100;

	//--Rendering--//
	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={keyboardVerticalOffset}
		>
			<View style={styles.container}>
				<View style={styles.inputContainerStyle}>
					<Input
						label="Provider"
						placeholder="provider name"
						onChangeText={(value) => setRecord({ ...record, provider: value })}
						value={record.provider}
						onFocus={() => setFocusedInput("provider")}
						onBlur={() => setFocusedInput(null)}
						inputStyle={styles.inputStyle}
						labelStyle={styles.labelStyle}
					/>
					<Input
						label="User ID"
						placeholder="username"
						onChangeText={(value) => setRecord({ ...record, userId: value })}
						value={record.userId}
						onFocus={() => setFocusedInput("userId")}
						onBlur={() => setFocusedInput(null)}
						inputStyle={styles.inputStyle}
						labelStyle={styles.labelStyle}
					/>
					<Input
						label="Password"
						placeholder="password"
						editable={false}
						onChangeText={(value) => setGeneratedPassword(value)}
						value={generatedPassword}
						inputStyle={{ fontSize: 16, color: "gray" }}
						labelStyle={styles.labelStyle}
					/>
				</View>

				<View style={styles.switchContainerStyle}>
					<Text style={styles.switchTitleStyle}>Upper case</Text>
					<View style={{ width: 153 }}></View>
					<Switch
						color="#211BBF"
						value={isUpperCaseSwitchOn}
						onValueChange={() => onToggleSwitch(1)}
					/>
				</View>
				<View style={styles.switchContainerStyle}>
					<Text style={styles.switchTitleStyle}>Lower case</Text>
					<View style={{ width: 152 }}></View>
					<Switch
						color="#211BBF"
						value={isLowerCaseSwitchOn}
						onValueChange={() => onToggleSwitch(2)}
					/>
				</View>
				<View style={styles.switchContainerStyle}>
					<Text style={styles.switchTitleStyle}>Numbers</Text>
					<View style={{ width: 168 }}></View>
					<Switch
						color="#211BBF"
						value={isNumbersSwitchOn}
						onValueChange={() => onToggleSwitch(3)}
					/>
				</View>
				<View style={styles.switchContainerStyle}>
					<Text style={styles.switchTitleStyle}>Special characters</Text>
					<View style={{ width: 105 }}></View>
					<Switch
						color="#211BBF"
						value={isSpecialsSwitchOn}
						onValueChange={() => onToggleSwitch(4)}
					/>
				</View>

				<View>
					<Text style={{ marginTop: 8, marginLeft: -40 }}>
						Password length: {sliderValue}
					</Text>
					<Slider
						style={{ width: 200, height: 40 }}
						step={1}
						minimumValue={1}
						maximumValue={26}
						//min-max range: 1-128
						//minimumTrackTintColor="#808080"
						//maximumTrackTintColor="#000000"
						minimumTrackTintColor="#211BBF"
						thumbTintColor="#211BBF"
						value={sliderValue}
						onValueChange={setSliderValue}
					/>
				</View>

				<View style={styles.buttonContainerStyle}>
					<Button
						icon="refresh"
						mode="contained"
						onPress={generatePassword}
						buttonColor="#411858"
					>
						Generate
					</Button>

					<View style={{ width: 40 }}></View>

					<Button
						icon="content-save"
						mode="contained"
						onPress={handleSave}
						buttonColor="#58184f"
						contentStyle={{ width: 130 }}
					>
						Save
					</Button>
				</View>

				<View>
					<Portal>
						<Dialog
							visible={dialogVisible}
							onDismiss={hideDialog}
							style={{ backgroundColor: "#efedf1" }}
						>
							<Dialog.Content>
								<Text variant="bodyMedium">{dialogAlert}</Text>
							</Dialog.Content>
							<Dialog.Actions>
								<Button onPress={hideDialog} labelStyle={{ color: "#581845" }}>
									Close
								</Button>
							</Dialog.Actions>
						</Dialog>
					</Portal>
				</View>

				<View>
					<Portal>
						<Dialog
							visible={saveDialogVisible}
							onDismiss={hideSaveDialog}
							style={{ backgroundColor: "#efedf1" }}
						>
							<Dialog.Content>
								<Text variant="bodyMedium">{dialogSaveAlert}</Text>
							</Dialog.Content>
							<Dialog.Actions>
								<Button
									onPress={hideSaveDialog}
									labelStyle={{ color: "#581845" }}
								>
									Close
								</Button>
							</Dialog.Actions>
						</Dialog>
					</Portal>
				</View>

				<Snackbar
					visible={snackbarVisible}
					onDismiss={onDismissSnackBar}
					action={{
						label: "OK",
					}}
				>
					Record saved!
				</Snackbar>

				<StatusBar barStyle="#fff" />
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	inputContainerStyle: {
		width: 300,
		fontSize: 10,
		//marginTop: 25,
	},
	switchContainerStyle: {
		flexDirection: "row",
		marginTop: -2,
	},
	switchTitleStyle: {
		marginTop: 12.6,
	},
	inputStyle: {
		fontSize: 16,
	},
	labelStyle: {
		fontSize: 16,
	},
	buttonContainerStyle: {
		flexDirection: "row",
		marginTop: 20,
	},
});
