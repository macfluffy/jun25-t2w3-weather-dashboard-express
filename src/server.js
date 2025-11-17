const app = require("./index");
const port = process.env.PORT || 5000;

app.listen(port, () => {
        console.log("Example Express server started on port: ", port);
    }); 