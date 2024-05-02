//import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar, FlatList } from "react-native";

import { Input, Text, Button, Icon, ListItem } from "@rneui/themed";
import { Switch, Snackbar } from "react-native-paper";

import {
	getDatabase,
	ref,
	set,
	push,
	onValue,
	remove,
} from "firebase/database";

export default function Vault({ database }) {
	//--States--//
	//Credentials:
	const [records, setRecords] = useState([]);

	//Snackbar:
	const [snackbarVisible, setSnackbarVisible] = useState(false);

	//Subtitles:
	const [subtitleVisibility, setSubtitleVisibility] = useState({});

	//--Functions--//
	//Handle snackbar:
	const onToggleSnackBar = () => setSnackbarVisible(!snackbarVisible);
	const onDismissSnackBar = () => setSnackbarVisible(false);

	//Handle subtitle visibility:
	const toggleSubtitleVisibility = (key) => {
		setSubtitleVisibility({
			...subtitleVisibility,
			[key]: !subtitleVisibility[key], // Toggle the visibility state for the specified key
		});
	};

	//Read data:
	useEffect(() => {
		onValue(ref(database, "/records"), (snapshot) => {
			try {
				if (snapshot.exists()) {
					const data = snapshot.val();
					const keys = Object.keys(data);
					console.log(Object.keys(data));
					console.log(Object.values(data));

					//Combine keys with data:
					const dataWithKeys = Object.values(data).map((obj, index) => {
						return { ...obj, key: keys[index] };
					});

					//Fetch keys from the database & iterate (map) over each of them:
					/*
					const thingsWithKeys = Object.keys(data).map((key) => ({
						...data[key], //get the properties associated with each key
						key: key, //key property for the key
					}));
					*/
					setRecords(dataWithKeys);
				} else {
					console.log("No data available");
					setRecords([]);
				}
			} catch (error) {
				console.error("Error in fetching data", error);
			}

			//const data = snapshot.val();
			//console.log(data);
			//console.log(Object.values(data)); //array returns-> data for flatlist
			//setThings(Object.values(data));
		});
	}, []);

	//Handle decrypting password!!!

	//Delete data:
	const handleDelete = (key) => {
		if (key) {
			remove(ref(database, `/records/${key}`))
				.then(() => {
					console.log("Item deleted succesfully");
					//Snackbar response:
					onToggleSnackBar();
				})
				.catch((error) => console.error("Error in deleting item: ", error));
		}
	};

	//Additionals:
	const listSeparator = () => {
		return (
			<View
				style={{
					height: 2,
					width: "80%",
					backgroundColor: "#fff",
					marginLeft: "10%",
				}}
			/>
		);
	};

	//--Rendering--//
	return (
		<View style={styles.container}>
			<FlatList
				style={{ marginLeft: "5%", width: "90%" }}
				data={records}
				//keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ListItem.Swipeable
						rightContent={(reset) => (
							<Button
								title="Delete"
								onPress={() => handleDelete(item.key)}
								icon={{ name: "delete", color: "white" }}
								buttonStyle={{ minHeight: "100%", backgroundColor: "#581845" }}
							/>
						)}
						bottomDivider
					>
						<ListItem.Content>
							<ListItem.Title style={{ fontSize: 20, color: "#8d8194" }}>
								{item.provider}
							</ListItem.Title>
							{subtitleVisibility[item.key] ? (
								<>
									<ListItem.Subtitle style={styles.listSubtitle}>
										{item.userId}
									</ListItem.Subtitle>
									<ListItem.Subtitle style={styles.listSubtitle}>
										{item.cryptedPassword}
									</ListItem.Subtitle>
								</>
							) : null}
						</ListItem.Content>
						<Icon
							name={subtitleVisibility[item.key] ? "eye-off" : "eye"}
							type="material-community"
							color="#676668"
							onPress={() => toggleSubtitleVisibility(item.key)}
						/>
					</ListItem.Swipeable>

					/*
					<ListItem bottomDivider>
						<ListItem.Content>
							<ListItem.Title>{item.product}</ListItem.Title>
							<ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
						</ListItem.Content>
						<Icon
							name="delete"
							type="material-community"
							color="red"
							onPress={() => deleteItem(item.key)}
						/>
					</ListItem>
					*/
				)}
				//ItemSeparatorComponent={listSeparator}
			/>

			<Snackbar
				visible={snackbarVisible}
				onDismiss={onDismissSnackBar}
				action={{
					label: "OK",
					//onPress: () => {
					// Do something
					//},
				}}
			>
				Record deleted succesfully!
			</Snackbar>

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
	listSubtitle: {
		color: "#676668",
	},
});
