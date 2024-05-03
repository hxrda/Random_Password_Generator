import { useState, useEffect } from "react";
import { StyleSheet, View, StatusBar, FlatList } from "react-native";
import { Button, Icon, ListItem } from "@rneui/themed";
import { Snackbar, ActivityIndicator } from "react-native-paper";
import * as Clipboard from "expo-clipboard";

import * as SecureStore from "expo-secure-store";

import { ref, onValue, remove } from "firebase/database";

///// COMPONENT /////
export default function Vault({ database, userId }) {
	//--States--//
	//Credentials:
	const [records, setRecords] = useState([]);

	//Snackbar:
	const [snackbarVisible, setSnackbarVisible] = useState(false);

	//Subtitles:
	const [subtitleVisibility, setSubtitleVisibility] = useState({});

	//Activity indicator:
	const [loading, setLoading] = useState(false);

	//--Functions--//
	//Read data:
	useEffect(() => {
		setLoading(true);

		onValue(ref(database, `/records/${userId}`), async (snapshot) => {
			try {
				if (snapshot.exists()) {
					const data = snapshot.val();
					const keys = Object.keys(data);
					console.log(Object.keys(data));
					console.log(Object.values(data));
					console.log(Object.entries(data));

					const dataWithKeys = await Promise.all(
						Object.values(data).map(async (obj, index) => {
							//Calculate days difference before saving it & db data to dataWithKeys
							const differenceInDays = calculateDaysDifference(obj.dateCreated);

							//Decrypt password before saving it & db data to dataWithKeys:
							const decryptedPassword = await decryptPassword(
								obj.cryptedPassword
							);

							return {
								...obj,
								key: keys[index],
								daysDiff: differenceInDays,
								decryptedPassword: decryptedPassword,
							};
						})
					);

					setRecords(dataWithKeys);

					setLoading(false);
					console.log(records);
				} else {
					console.log("No data available");
					setRecords([]);
					setLoading(false);
				}
			} catch (error) {
				console.error("Error in fetching data", error);
				setLoading(false);
			}
		});
	}, []);

	//Delete data:
	const handleDelete = (key) => {
		if (key) {
			remove(ref(database, `/records/${userId}/${key}`))
				.then(() => {
					console.log("Item deleted succesfully");

					//Snackbar confirmation:
					onToggleSnackBar();
				})
				.catch((error) => console.error("Error in deleting item: ", error));
		}
	};

	//Handle date calculation:
	const calculateDaysDifference = (dateCreated) => {
		try {
			const currentDate = new Date();
			const recordDate = new Date(dateCreated);

			// Difference in milliseconds (ms):
			const timeDifferenceInMillis =
				currentDate.getTime() - recordDate.getTime();

			// Convert ms to days
			const millisecondsPerDay = 1000 * 60 * 60 * 24;
			const differenceInDays = Math.floor(
				timeDifferenceInMillis / millisecondsPerDay
			);

			console.log("Days difference:", differenceInDays);
			return differenceInDays;
		} catch (error) {
			console.error("Error calculating difference in days:", error);
			return null;
		}
	};

	//Handle decrypting the password:
	const decryptPassword = async (encrypted) => {
		try {
			//Get key:
			const secretKey = await SecureStore.getItemAsync(`secretKey_${userId}`);
			if (!secretKey) {
				console.error("Public key not found for user, Decryption:", userId);
				return "";
			}

			//Decrypt:
			var CryptoJS = require("crypto-js");
			const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
			var decrypted = bytes.toString(CryptoJS.enc.Utf8);

			if (!decrypted) {
				console.error("Decryption failed or invalid data");
				return "";
			}

			return decrypted;
		} catch (error) {
			console.error("Error decrypting password:", error);
			return "";
		}
	};

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
											{item.decryptedPassword}
										</ListItem.Subtitle>
										<Icon
											name="content-copy"
											type="material-community"
											color="#676668"
											onPress={() => {
												copyToClipboard(item.decryptedPassword);
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
