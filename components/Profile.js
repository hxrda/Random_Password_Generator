//import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	StatusBar,
	FlatList,
	TouchableOpacity,
} from "react-native";

import { Input, Text, Icon, ListItem } from "@rneui/themed";
import { Switch, Snackbar, Button } from "react-native-paper";

import {
	getDatabase,
	ref,
	set,
	push,
	onValue,
	remove,
} from "firebase/database";

//>>>Pass user email here instead of id.

export default function Profile({ database, userId }) {
	//--States--//
	const items = [
		{ title: "Account", icon: "account-outline" },
		{ title: "Notifications", icon: "bell-outline" },
		{ title: "Privacy & Security", icon: "lock-outline" },
		{ title: "Help and Support", icon: "chat-outline" },
		{ title: "About", icon: "help-circle-outline" },
	];

	//--Functions--//
	const handleLogout = () => {
		//TBA
	};

	//--Rendering--//
	return (
		<View style={styles.container}>
			<View style={styles.upperContainer}>
				<Icon name="account-circle" size={100} color="#a9b1b6" />
				<Text style={{ marginLeft: 12 }}>Hello {userId}!</Text>
			</View>

			<FlatList
				style={{ width: "90%" }}
				data={items}
				renderItem={({ item }) => (
					<TouchableOpacity
						activeOpacity={0.6}
						onPress={() => console.log("Item pressed:", item.title)}
					>
						<ListItem style={{ marginTop: 10 }}>
							<Icon
								name={item.icon}
								type="material-community"
								color="grey"
								style={styles.icon}
							/>
							<ListItem.Content>
								<ListItem.Title>{item.title}</ListItem.Title>
							</ListItem.Content>
							<ListItem.Chevron />
						</ListItem>
					</TouchableOpacity>
				)}
			/>

			<View style={{ marginTop: 1, flex: 2 }}>
				<Button
					icon="logout"
					iconPosition="right"
					mode="contained"
					onPress={() => handleLogout()}
					buttonColor="#581845"
				>
					Logout
				</Button>
			</View>

			<StatusBar barStyle="#fff" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9f9f9",
		alignItems: "center",
		justifyContent: "center",
	},
	upperContainer: {
		marginTop: 70,
		marginBottom: 20,
	},
});
