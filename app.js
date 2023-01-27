const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://Piyush:jaswal@cluster0.lvt4be2.mongodb.net/toDoList?retryWrites=true&w=majority");
const app = express();
app.use(express.static(__dirname+'/style'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const itemsSchems = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchems);
const item1 = new Item({
  name: "Hi workout"
})
const item2 = new Item({
  name: "Hit women"
})
const item3 = new Item({
  name: "Hit pio"
})
const listSchema = mongoose.Schema(
  {
    name: String,
    items: [itemsSchems]
  });
const List = mongoose.model("list", listSchema);

const defItems = [item1, item2, item3];


app.get('/', function (req, res) {
  Item.find({}, function (err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defItems, function (err) {
        if (err)
          console.log(err);
        else
          console.log("Sucess inserting data");
      })
      res.redirect("/");
    }
    res.render("file", { tday: "Today", tolist: founditems });
  })
}
);


app.get("/:wlist", function (req, res) {
  const customList = req.params.wlist;
  List.findOne({ name: customList }, function (err, found) {
    // console.log(found);
    if (!err) {
      if (!found) {
        const list = new List({
          name: customList,
          items: defItems
        })
        list.save();
        res.redirect("/" + customList);
      }
      else {
        res.render("file", { tday: customList, tolist: found.items });
      }
    }


  })
})
/// WORK YET TO BE DOne
app.post('/delete', function (req, res) {
  var id = req.body.work;
  let block = req.body.tag;
  if (block === "Today") {
    Item.findByIdAndDelete(id, function (err, docs) {
      if (err) {
        console.log(err)
      }
      else {
        console.log("Deleted : ", docs);
      }
      res.redirect("/");
    });
  }
  else{
    List.updateOne({ name: block}, {
      $pull: {
          items: {_id: id}
      },
  },
   function (err, docs) {
    if (err) {
      console.log(err)
    }
    else {
      console.log("Deleted : ", docs);
    }
  }
  );
  res.redirect("/"+block);
  }

})
app.post('/', function (req, res) {
  const lname = req.body.list;
  const newit = new Item({
    name: req.body.thisitem
  })
  if (lname === "Today") {
    newit.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: lname }, function (err, foundList) {
      foundList.items.push(newit);
      foundList.save();
      res.redirect("/" + lname);
    })
  }

});

app.listen(process.env.PORT || 3000, () => {
  console.log('I am Listening');
})