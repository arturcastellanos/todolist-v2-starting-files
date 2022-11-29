
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Item = require("./Items");
const List = require("./List");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://arturcastellanos:covbes-gohrAx-dydxe8@cluster0.s7lsist.mongodb.net/?retryWrites=true&w=majority")

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]
// run()
// async function run() {
//     try {
//       // const updateItem = await Item.findOneAndUpdate({name: "Something third"}, {name: "<-- Hit this to delete an item"})

//     } catch (e) {
//         console.log(e.message);
//     }
// } 

// // Show all items
// Item.find({}, (err, docs) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(docs);
//     }
//   })

app.get("/", function(req, res) {

  Item.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
        if (docs.length === 0) {
          

          Item.insertMany(defaultItems, (err, docs) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Default items added to DB");
            }
          });
          // res.redirect("/");
        } else {
          res.render("list", {listTitle: "Today", newListItems: docs});
        }
              
    }
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();

  const item = new Item ({
    name: itemName
  }) 

  if (listName === "Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }

});

app.get("/:customListName", (req, res) => {

  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
      
        list.save()
        res.redirect('/' + customListName)
      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });  
  
})

app.post("/delete", (req, res) => {
  
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName.trim();
  if (listName === "Today") {
    Item.findByIdAndRemove({_id: checkedItemId}, (err, item) => {
      if (!err) {
        console.log(item + " deleted");
        res.redirect("/");
      }
    });
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName)
        }
      })
  } 

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000 || process.env.PORT, function() {
  console.log("Server started on port 3000");
});
