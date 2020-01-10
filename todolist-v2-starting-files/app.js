
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _= require('lodash');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-shun:Ichigo12@cluster0-jhg9g.mongodb.net/toDoListDB', {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);


const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema)

const Item = mongoose.model('Item', itemsSchema);

const itemOne = new Item ({
    name: 'Do laundry'
})
const itemTwo = new Item ({
    name: 'Do dishes'
})
const itemThree = new Item ({
    name: 'Study'
})






app.set("view engine", "ejs"); 

app.get("/", function(req, res){
    
    Item.find({}, function(err,foundItems){
        if (!err){
        res.render('list', {listTitle: 'Today', newListItems: foundItems});
        }
    })



});

app.post('/', function(req,res){
   
    const itemName = req.body.newItem;
    const listName = req.body.list

    const item = new Item ({
        name: itemName
    });

    if (listName === 'Today'){
        item.save();
        res.redirect('/');
    } else {
        List.findOne({name: listName}, function(err,foundList){
            foundList.items.push(item)
            foundList.save();
            res.redirect(`/${listName}`)
        })
    }
    

});

app.post('/delete', function(req, res){
    const checkedItemId=req.body.checkBox;
    const listName = req.body.listName;
    if (listName=== 'Today'){
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(err){
            console.log('error')
        }

    res.redirect('/');
});
}else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if(!err){
            res.redirect('/'+listName);
        }
    })

}
});
 



app.get('/about', function(req,res){
    res.render('about');

});

app.get('/:topic', function(req,res){
    
      const topic= _.capitalize(req.params.topic);
      List.findOne({name:topic},function(err,foundList){
          if (!err){
              if(!foundList){
                const list = new List({
                    name: topic,
                    items: []
                });
                list.save();
                res.redirect(`/${topic}`)
              }else{
                res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
            }
          }
      });

  
  });

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function(){
  console.log("Server started successfully.");
})
