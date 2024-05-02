//Home component is initially rendered:
import React, { useState, useEffect } from "react";
//import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, FlatList, StatusBar } from "react-native";

import { Input, Text, Button, Icon, ListItem } from "@rneui/themed";
import { Switch } from "react-native-paper";
import Slider from "@react-native-community/slider";

//import { Header } from "@rneui/themed";

//OG status bar: <StatusBar style="auto" />

export default function Home() {
	//--States--//
	//Credentials
	const [provider, setProvider] = React.useState("");
	const [userId, setUserId] = React.useState("");
	const [generatedPassword, setGeneratedPassword] = React.useState("");
	const [cryptedPassword, setCryptedPassword] = React.useState("");

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

	//--Functions--//

	//Handle switch toggle:
	const onToggleSwitch = (switchId) => {
		//if statements
		if (switchId === 1) {
			setUpperCaseSwitchOn(!isUpperCaseSwitchOn);
			setUpper(isUpperCaseSwitchOn ? "off" : "on");
			console.log("Switch 1");
			console.log({ isUpperCaseSwitchOn });
			console.log({ upper });
		} else if (switchId === 2) {
			setLowerCaseSwitchOn(!isLowerCaseSwitchOn);
			setLower(isLowerCaseSwitchOn ? "off" : "on");
			console.log("Switch 2");
			console.log(lower);
		} else if (switchId === 3) {
			setNumbersSwitchOn(!isNumbersSwitchOn);
			setNumbers(isNumbersSwitchOn ? "off" : "on");
			console.log("Switch 3");
			console.log(numbers);
		} else if (switchId === 4) {
			setSpecialsSwitchOn(!isSpecialsSwitchOn);
			setSpecial(isSpecialsSwitchOn ? "off" : "on");
			console.log("Switch 4");
			console.log(special);
		}
	};

	/*
	const onSwitch1 = () => {
		setIsSwitch1On(!isSwitch1On);
		console.log("Switch 1");
	};

	const onSwitch2 = () => {
		setIsSwitch2On(!isSwitch2On);
		console.log("extra");
	};
	*/

	//all on:
	// https://passwordwolf.com/api/?exclude=&repeat=1
	//other:
	//https://passwordwolf.com/api/?exclude=&repeat=1
	//https://passwordwolf.com/api/?upper=off&lower=off&numbers=off&special=off&exclude=&repeat=1

	const generatePassword = () => {
		//fetch
		fetch(`https://api.github.com/search/repositories?q=${keyword}`) //use backticks ``
			.then((response) => {
				if (!response.ok)
					throw new Error("Error in fetch: " + response.statusText);
				return response.json();
			})
			.then((data) => {
				setRepositories(data.items); //array of repo objects
				setKeyword(""); //empty input
				setLoading(false); //hide loading, show the others since we got the data
			})
			.catch((err) => console.error(err));
	};

	const saveItem = () => {
		//save to DB
	};

	//--Rendering--//
	return (
		<View style={styles.container}>
			<View style={styles.inputContainerStyle}>
				<Input
					label="Provider"
					placeholder="provider name"
					onChangeText={(provider) => setProvider(provider)}
					value={provider}
					inputStyle={styles.inputStyle}
					labelStyle={styles.labelStyle}
				/>
				<Input
					label="User ID"
					placeholder="username"
					onChangeText={(userId) => setUserId(userId)}
					value={userId}
					inputStyle={styles.inputStyle}
					labelStyle={styles.labelStyle}
				/>
				<Input
					label="Password"
					placeholder="password"
					onChangeText={(generatedPassword) =>
						setGeneratedPassword(generatedPassword)
					}
					value={generatedPassword}
					inputStyle={styles.inputStyle}
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
					maximumValue={128}
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
					title="Generate"
					onPress={generatePassword}
					icon={{ name: "refresh", color: "white", iconPosition: "left" }}
					color="#0FC9BA"
					//radius="lg"
					buttonStyle={{
						borderRadius: 5,
					}}
					containerStyle={
						{
							//width: 100,
							//marginHorizontal: 50,
							//marginVertical: 10,
							//marginRight: 10,
						}
					}
				/>

				<View style={{ width: 40 }}></View>
				<Button
					title="Save"
					onPress={saveItem}
					icon={{ name: "save", color: "white", iconPosition: "left" }}
					color="#0FC979"
					//radius="lg"
					buttonStyle={{
						borderRadius: 5,
					}}
					containerStyle={{
						width: 130,
					}}
				/>
			</View>

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
	inputContainerStyle: {
		//marginTop: 30,
		width: 300,
		fontSize: 10,
	},
	switchContainerStyle: {
		flexDirection: "row",
		marginTop: -2,
	},
	switchTitleStyle: {
		marginTop: 12.6,
	},
	//switchContainerSpace: {
	//	width: 153,
	//},
	inputStyle: {
		fontSize: 16, // Adjust the font size as needed
	},
	labelStyle: {
		fontSize: 16, // Adjust the font size as needed
	},
	buttonContainerStyle: {
		flexDirection: "row",
		marginTop: 20,
	},
});

/*
const onSwitch1 = () => {
		setIsSwitch1On(!isSwitch1On);
		console.log("Switch 1");
	};

	const onSwitch2 = () => {
		setIsSwitch2On(!isSwitch2On);
		console.log("Switch 2");
	};

	---
	<Switch value={isSwitch2On} onValueChange={onSwitch2} />

*/

/*
buttonsContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  marginVertical: 20,
},
*/
