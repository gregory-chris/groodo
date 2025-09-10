I'd like to create a web app for managing my tasks for the work week. In my case (in Israel) it's sunday to thursday. 
The web app will look like a calendar, with column for each day in the work week, but instead of calendar events placed on time slots, there will be "todo" items, placed one by one. Double clicking on an item will show a simple modal window with the todo item as a title, and a text area box for more detailed description. The desciprion field would a very simple wysiwig editor (preferrably a markdown editor)
Every todo item can be marked as "done" in a checkbox to the left of the item, and "delete" option to right right of it. (the renaming will be done in the modal window)

There will be 5 columns for each working day in the current week. Every column shows the date and the week day (sunday, monday, etc.). Today's column will be a bit highlighted

Above the columns, there will be navigation buttons to move a week forward or backwards, and "today" button to jump to today's week.

On the left side, before all the week day columns, will be a general todo list, with tasks that are generally relevant, not specifically to some date.

All the todo items are movable, i.e. the order of the items can be changed using the standard drag and drop mechanism.

All the data is stored in "localStorage" of the browser, and is updated on every change that is done on the page, like add a new item, update existing, delete some item, etc.