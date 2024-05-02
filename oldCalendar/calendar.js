import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import format from "date-fns/format";
import parse from "date-fns/parse";
import parseISO from "date-fns/parseISO";
import startOfWeek from "date-fns/startOfWeek";
import addMinutes from "date-fns/addMinutes";
import getDay from "date-fns/getDay";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import enUS from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
	"en-US": enUS,
};

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

function AppCalendar() {
	//States:
	const [allEvents, setAllEvents] = useState([]);

	//Calendar view start and end times:
	const minTime = setHours(setMinutes(new Date(), 0), 6);
	const maxTime = setHours(setMinutes(new Date(), 0), 22);

	//Functions:
	useEffect(() => {
		fetchTrainings();
	}, []);

	const fetchTrainings = () => {
		fetch(import.meta.env.VITE_API_URL + "/gettrainings")
			.then((response) => {
				if (!response.ok)
					throw new Error("Something went wrong: " + response.statusText);
				return response.json();
			})
			.then((data) => {
				const formattedEvents = data.map((training) => ({
					title: `${training.activity} / ${training.customer.firstname} ${training.customer.lastname}`,
					start: parseISO(training.date),
					end: addMinutes(parseISO(training.date), training.duration),
				}));

				setAllEvents(formattedEvents);
			})

			.catch((err) => console.error(err));
	};

	//Rendering:
	return (
		<>
			<div className="AppCalendar">
				<Calendar
					localizer={localizer}
					events={allEvents}
					startAccessor="start"
					endAccessor="end"
					min={minTime}
					max={maxTime}
					style={{ height: 500, margin: "50px" }}
				/>
			</div>
		</>
	);
}

export default AppCalendar;
