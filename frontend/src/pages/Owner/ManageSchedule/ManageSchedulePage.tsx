import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function ManageSchedulePage() {
  return (
    <FullCalendar
      plugins={[resourceTimeGridPlugin, interactionPlugin]}
      initialView="resourceTimeGridDay"
      selectable={true}
      resources={[
        { id: "301", title: "Phòng 301" },
        { id: "302", title: "Phòng 302" },
        { id: "303", title: "Phòng 303" },
      ]}
      events={[
        {
          id: "1",
          resourceId: "301",
          title: "Khách A",
          start: "2026-03-04T08:00:00",
          end: "2026-03-04T10:00:00",
        },
      ]}
      select={(info) => {
        console.log("Slot clicked:", info);
      }}
    />
  );
}