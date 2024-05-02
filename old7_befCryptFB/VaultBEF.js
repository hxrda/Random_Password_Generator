//import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar, FlatList } from "react-native";
//import Clipboard from "@react-native-clipboard/clipboard";
import * as Clipboard from "expo-clipboard";

import { Input, Text, Button, Icon, ListItem } from "@rneui/themed";
import {
	Switch,
	Snackbar,
	ActivityIndicator,
	MD2Colors,
} from "react-native-paper";

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

	//Activity indicator:
	const [loading, setLoading] = useState(false);

	//Additionals:
	//const [daysSinceGenerated, setDaysSinceGenerated] = useState(0); ??

	//--Functions--//
	//Handle snackbar:
	const onToggleSnackBar = () => setSnackbarVisible(!snackbarVisible);
	const onDismissSnackBar = () => setSnackbarVisible(false);

	//Handle subtitle visibility:
	const toggleSubtitleVisibility = (key) => {
		setSubtitleVisibility({
			...subtitleVisibility,
			[key]: !subtitleVisibility[key],
		});
	};

	//Handle clipboard (copy functionality):
	const copyToClipboard = async (copiedPassword) => {
		await Clipboard.setStringAsync(copiedPassword);
	};

	//Handle date calculation:
	const calculateDaysDifference = (dateCreated) => {
		try {
			const currentDate = new Date();
			const recordDate = new Date(dateCreated);

			// Difference in milliseconds (ms)
			const timeDifferenceInMillis =
				currentDate.getTime() - recordDate.getTime();

			// Ms converted to days
			const millisecondsPerDay = 1000 * 60 * 60 * 24;
			const differenceInDays = Math.floor(
				timeDifferenceInMillis / millisecondsPerDay
			);

			console.log("Days difference:", differenceInDays);
			return differenceInDays;
		} catch (error) {
			console.error("Error calculating days difference:", error);
			return null;
		}
	};

	//Read data:
	useEffect(() => {
		setLoading(true);

		onValue(ref(database, "/records"), (snapshot) => {
			try {
				if (snapshot.exists()) {
					const data = snapshot.val();
					const keys = Object.keys(data);
					console.log(Object.keys(data));
					console.log(Object.values(data));
					console.log(Object.entries(data));

					//>>>> Handle decrypting password!!!

					//V2
					const dataWithKeys = Object.values(data).map((obj, index) => {
						const differenceInDays = calculateDaysDifference(obj.dateCreated);

						return { ...obj, key: keys[index], daysDiff: differenceInDays };
					});

					//V1
					//Combine keys with data:
					/*
					const dataWithKeys = Object.values(data).map((obj, index) => {
						return { ...obj, key: keys[index] };
					});
					*/

					//Fetch keys from the database & iterate (map) over each of them:
					/*
					const thingsWithKeys = Object.keys(data).map((key) => ({
						...data[key], //get the properties associated with each key
						key: key, //key property for the key
					}));
					*/
					setRecords(dataWithKeys);
					setLoading(false);
					console.log(records);
				} else {
					console.log("No data available");
					setRecords([]);
				}
			} catch (error) {
				console.error("Error in fetching data", error);
			}
		});
	}, []);

	//Delete data:
	const handleDelete = (key) => {
		if (key) {
			remove(ref(database, `/records/${key}`))
				.then(() => {
					console.log("Item deleted succesfully");

					//Snackbar confirmation:
					onToggleSnackBar();
				})
				.catch((error) => console.error("Error in deleting item: ", error));
		}
	};

	//--Rendering--//
	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#411858" />
			</View>
		);
	} else {
		return (
			<View style={styles.container}>
				<FlatList
					style={{ width: "90%" }}
					data={records}
					renderItem={({ item }) => (
						<ListItem.Swipeable
							rightContent={(reset) => (
								<Button
									title="Delete"
									onPress={() => handleDelete(item.key)}
									icon={{ name: "delete", color: "white" }}
									buttonStyle={{
										minHeight: "100%",
										backgroundColor: "#581845",
									}}
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
										<Icon
											name="content-copy"
											type="material-community"
											color="#676668"
											onPress={() => {
												copyToClipboard(item.cryptedPassword);
											}}
										/>
									</>
								) : (
									<ListItem.Subtitle style={{ color: "#8c0b37" }}>
										Created {item.daysDiff} days ago
									</ListItem.Subtitle>
								)}
							</ListItem.Content>
							<Icon
								name={subtitleVisibility[item.key] ? "eye-off" : "eye"}
								type="material-community"
								color="#676668"
								onPress={() => toggleSubtitleVisibility(item.key)}
							/>
						</ListItem.Swipeable>
					)}
				/>

				<Snackbar
					visible={snackbarVisible}
					onDismiss={onDismissSnackBar}
					action={{
						label: "OK",
					}}
				>
					Record deleted succesfully!
				</Snackbar>

				<StatusBar barStyle="#fff" />
			</View>
		);
	}
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
