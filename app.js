const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false });

const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your to-do list!",
});

const item2 = new Item({
    name: "Hit the + button to add new item",
});

const item3 = new Item({
    name: "Click on the check-box to delete an item",
});

const defaultItems = [item1, item2, item3];
const listSchema = {
    name:String,
    items: [itemsSchema]
}
const List = mongoose.model("List",listSchema)


app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("successfully saved data")
                }

            });
            res.redirect("/");
        } else {

            res.render("index", { kindofday: "Today", newlistitems: foundItems });
        }
    });
});

app.get("/:CustomeListName",function(req,res){
    const CustomeListName =req.params.CustomeListName;
    List.findOne({name:CustomeListName},function(err,foundList){
        if(!err){
            if(!foundList){
                // create a new list 
                const list = new List({
                    name: CustomeListName,
                    items: defaultItems
                });
                list.save();
            } else{
                // show an existing list 
                res.render("index",{ kindofday:foundList.name, newlistitems: foundList.items });
            }
        }
    })

   
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
     name: itemName
    });
    item.save();
    res.redirect("/");
});

app.post("/delete",function(req,res){
    const checkedItemID = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemID,function(err){
        if(!err){
            console.log("successfully deleted checked item!")
            res.redirect("/");
        }
    })
})


app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function (rq, res) {
    console.log("Server started at port 3000");
});