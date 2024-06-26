import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	ScrollView,
	StatusBar,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { Input, Text } from "@rneui/themed";
import { Switch, Snackbar, Button, Dialog, Portal } from "react-native-paper";
import Slider from "@react-native-community/slider";

import CryptoJS from "crypto-js";
import * as SecureStore from "expo-secure-store";

import { ref, push } from "firebase/database";

import { API_URL } from "@env";

///// COMPONENT /////
export default function Home({ database, userId }) {
	//--States--//
	//Credentials:
	const [record, setRecord] = useState({
		provider: "",
		userId: "",
		cryptedPassword: "",
		dateCreated: "",
	});
	const [generatedPassword, setGeneratedPassword] = React.useState("");

	//Switches:
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

	//Check requirement for saving data in db:
	const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);

	//--Testing--//
	//Testing state updates:
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
	//Get current date after password generation & crypting:
	useEffect(() => {
		if (record.cryptedPassword) {
			const currentDate = new Date();
			const dateString = currentDate.toISOString();
			console.log("date string:", dateString);

			setRecord({ ...record, dateCreated: dateString });
		}
	}, [record.cryptedPassword]);

	//Fetch API:
	const generatePassword = () => {
		// Check that at least one switch selection is on:
		if (
			!isUpperCaseSwitchOn &&
			!isLowerCaseSwitchOn &&
			!isNumbersSwitchOn &&
			!isSpecialsSwitchOn
		) {
			// If no selection is on, display an alert & exit without proceeding to fetch:
			showDialog();

			return;
		}

		//If at least 1 switch selection is on, proceed to fetch:
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
					//Fetch secret key & handle crypting:
					const secretKey = await SecureStore.getItemAsync(
						`secretKey_${userId}`
					);
					if (!secretKey) {
						console.error(
							"Public key not found for user (Encryption): ",
							userId
						);
						return;
					}

					//Encrypt generated password with secret key:
					const encryptedPassword = CryptoJS.AES.encrypt(
						generatorResult,
						secretKey
					).toString();

					//Update record state obj. with encrypted password:
					setRecord((prevRecord) => ({
						...prevRecord,
						cryptedPassword: encryptedPassword,
					}));
				} catch (error) {
					console.error("Error retrieving secret key:", error);
				}
			})

			.catch((err) => console.error(err));
	};

	//Save data to database:
	const handleSave = async () => {
		if (!isPasswordGenerated) {
			// If password has not been generated, show dialog and return without proceeding:
			showSaveDialog();
			return;
		}

		// If password has been generated, proceed to save data:
		push(ref(database, `/records/${userId}`), record);

		//Snackbar confirmation response:
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

	//Handle snackbar:
	const onToggleSnackBar = () => setSnackbarVisible(!snackbarVisible);
	const onDismissSnackBar = () => setSnackbarVisible(false);

	//Handle dialogs:
	const showDialog = () => setDialogVisible(true);
	const hideDialog = () => setDialogVisible(false);

	const showSaveDialog = () => setSaveDialogVisible(true);
	const hideSaveDialog = () => setSaveDialogVisible(false);

	//--Rendering--//
	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : null}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
		>
			<ScrollView
				style={styles.container}
				contentContainerStyle={{
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<View style={styles.inputContainerStyle}>
					<Input
						label="Provider"
						placeholder="provider name"
						onChangeText={(value) => setRecord({ ...record, provider: value })}
						value={record.provider}
						inputStyle={styles.inputStyle}
						labelStyle={styles.labelStyle}
					/>
					<Input
						label="User ID"
						placeholder="username"
						onChangeText={(value) => setRecord({ ...record, userId: value })}
						value={record.userId}
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
						//min-max range: 1-128
						minimumValue={1}
						maximumValue={26}
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
						contentStyle={{ width: 130, marginBottom: 2 }}
					>
						Save
					</Button>
				</View>

				<StatusBar barStyle="#fff" />
			</ScrollView>

			<Snackbar
				visible={snackbarVisible}
				onDismiss={onDismissSnackBar}
				action={{
					label: "OK",
				}}
			>
				Record saved!
			</Snackbar>

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
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	inputContainerStyle: {
		width: 300,
		fontSize: 10,
		marginTop: 35,
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
		marginTop: 22,
	},
});
