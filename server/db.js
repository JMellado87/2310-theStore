
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_store_db');
const { v4 } = require('uuid');
const uuidv4 = v4;
// const bcrypt = require('bcrypt');
// const jwt = require ('jsonwebtoken');

const fetchLineItems = async()=> {
  const SQL = `
    SELECT *
    FROM
    line_items
    ORDER BY product_id
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async()=> {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

// const findUserByToken = async(token) => {
//   try {
//     const payload = await jwt.verify(token, process.env.JWT)
//     const SQL = `
//       SELECT id, username
//       FROM users
//       WHERE id = $1
//     `
//     const response = await client.query(SQL, [payload.id])
//     if(!response.rows.length){
//       const error = Error('bad credentials')
//       error.status = 401
//       throw error
//     }

//     return response.rows[0]
//   } catch (error) {
//     console.log(error)
//   }
// }

// const authenticate = async(credentials) => {
//   const SQL = `
//     SELECT id, password
//     FROM users
//     WHERE username = $1
//   `
//   const response = await client.query(SQL, [credentials.username])
//   if(!response.rows.length){
//     const error = Error('bad credentials')
//     error.status = 401
//     throw error
//   }

//   const valid = await bcrypt.compare(credentials.password, response.rows[0].password)
//   if(!valid){
//     const error = Error('bad credentials')
//     error.status = 401
//     throw error
//   }

//   return jwt.sign({id: response.rows[0].id}, process.env.JWT)

// }

// const createUser = async(user) => {
//   if(!user.username.trim() || !user.password.trim()) {
//     throw Error('must have username and password')
//   }
//   user.password = await bcrypt.hash(user.password, 5);
//   const SQL =`
//     INSERT INTO users (id, username, password)
//     VALUES ($1, $2, $3)
//     RETURNING *
//   `
//   const response = await client.query(SQL, [ uuidv4(), user.username, user.password]);
//   return response.rows[0];
// }


const createProduct = async(product)=> {
  const SQL = `
    INSERT INTO products (id, name, price, description, img)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const response = await client.query(SQL, [ uuidv4(), product.name, product.price, product.description, product.img]);
  return response.rows[0];
};

const ensureCart = async(lineItem)=> {
  let orderId = lineItem.order_id;
  if(!orderId){
    const SQL = `
      SELECT order_id 
      FROM line_items 
      WHERE id = $1 
    `;
    const response = await client.query(SQL, [lineItem.id]);
    orderId = response.rows[0].order_id;
  }
  const SQL = `
    SELECT * 
    FROM orders
    WHERE id = $1 and is_cart=true
  `;
  const response = await client.query(SQL, [orderId]);
  if(!response.rows.length){
    throw Error("An order which has been placed can not be changed");
  }
};
const updateLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  SQL = `
    UPDATE line_items
    SET quantity = $1
    WHERE id = $2
    RETURNING *
  `;
  if(lineItem.quantity <= 0){
    throw Error('a line item quantity must be greater than 0');
  }
  const response = await client.query(SQL, [lineItem.quantity, lineItem.id]);
  return response.rows[0];
};

const createLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  const SQL = `
  INSERT INTO line_items (product_id, order_id, id) 
  VALUES($1, $2, $3) 
  RETURNING *
`;
response = await client.query(SQL, [ lineItem.product_id, lineItem.order_id, uuidv4()]);
return response.rows[0];
};

const deleteLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  const SQL = `
    DELETE from line_items
    WHERE id = $1
  `;
  await client.query(SQL, [lineItem.id]);
};

const updateOrder = async(order)=> {
  const SQL = `
    UPDATE orders 
    SET is_cart = $1 
    WHERE id = $2 RETURNING *
  `;
  const response = await client.query(SQL, [order.is_cart, order.id]);
  return response.rows[0];
};

const fetchOrders = async()=> {
  const SQL = `
    SELECT * 
    FROM orders;
  `;
  const response = await client.query(SQL);
  const cart = response.rows.find(row => row.is_cart);
  if(!cart){
    await client.query('INSERT INTO orders(is_cart, id) VALUES(true, $1)', [uuidv4()]); 
    return fetchOrders();
  }
  return response.rows;
};
// insert into SQL when ready to go back to users 
//DROP TABLE IF EXISTS users;

    
    // CREATE TABLE users(
    //   id UUID PRIMARY KEY,
    //   created_at TIMESTAMP DEFAULT now(),
    //   username VARCHAR(100) UNIQUE NOT NULL,
    //   password VARCHAR(100) NOT NULL
    // );

  // const [jonas, parker, dylan, devin] = await Promise.all([
  //   createUser({username: 'jonas', password: 'abel'}),
  //   createUser({username: 'parker', password: 'muns'}),
  //   createUser({username: 'dylan', password: 'koob'}),
  //   createUser({username: 'devin', password: 'duco'}),
  // ]);
  
const seed = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS line_items;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS orders;
    
    CREATE TABLE products(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      name VARCHAR(100) UNIQUE NOT NULL,
      description VARCHAR(1000),
      img VARCHAR(900),
      price INTEGER

    );

    CREATE TABLE orders(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      is_cart BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE line_items(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      product_id UUID REFERENCES products(id) NOT NULL,
      order_id UUID REFERENCES orders(id) NOT NULL,
      quantity INTEGER DEFAULT 1,
      CONSTRAINT product_and_order_key UNIQUE(product_id, order_id)
    );
    
  `;
  await client.query(SQL);
  const [Bowl_Licker, Candle_Beggar, Christmans_Cat, Door_Slammer, Doorway_Sniffer, Gryla, Gully_Gawk, Leppaludi, Meathook, Pot_Licker, Sausage_Snatcher, Sheep_Code_Clod, Shorty, Skyr_Glutton, Spoon_Licker, Window_Peeper ] = await Promise.all([
    createProduct({ name: 'Bowl_Licker', price: 200, description: "Askasleikir or Bowl Licker (17th Dec.) is the sixth Yule Lad to make his way down from the mountains. In the old Icelandic turf farmhouses the family sat on the edge of their beds to eat. Each family member had their own bowl which had a lid to keep the food warm. Askasleikir sneaks into a farmhouse and lies in wait under the bed of the unsuspecting person who innocently puts his or her 'askur' down on the floor between bites - whereupon the lad swipes it away to lick it spotlessly clean.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-bowl-licker_400x.jpg?v=1613136632" }),
    createProduct({ name: 'Candle_Beggar', price: 150, description:"Kertasnikir orCandle Beggar or , arrives on Christmas Eve Day, 24 December. In former times, candles were the brightest lights available to people. They were so rare and precious that all children longed to have their very own candle for Christmas. And poor Candle Beggar, well, he also longed for a candle. ", img: "https://icelandicstore.is/cdn/shop/files/icelandic-yule-lad-candle-beggar_kertasnykir_christmas_400x.jpg?v=1701276672" }),
    createProduct({ name: 'Christmans_Cat', price: 100, description: "Yule cat - Jolakotturinn, According to legends, the Christmas or Yule Cat is a monstrously huge black cat that only appears at Christmas Eve, looking for children who are not well dressed or wearing new clothing. If the Yule Cat finds one, he eats it. It's still traditional in Iceland to give children something new to wear before Christmas “so that the Christmas cat doesn't get you” — although, of course, no one really believes in its literal existence.", img: "https://icelandicstore.is/cdn/shop/products/DSC_0113-3_960x1200_786ddfc3-d799-4b6c-8d38-760f5b638bdf_600x.jpg?v=1671034389" }),
    createProduct({ name: 'Door_Slammer', price: 100, description: "Hurdaskellir or Door Slammer (18th Dec.) is the seventh Yule Lad to journey down from the mountains. Surprisingly not interested in pilfering food like most of his brothers, Hurdaskellir has a much more disturbing obsession: door slamming. Every door he comes across he must give a good slam, often repeatedly. For maximum effect and greatest pleasure, he indulges his desire in the middle of the night.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-door-slammer_400x.jpg?v=1615865671" }),
    createProduct({ name: 'Doorway_Sniffer', price: 100, description: "Gattathefur or Doorway Sniffer (22nd Dec.) is the eleventh Yule Lad to make his way down from the mountains. With his highly sensitive and generously proportioned nose, he can easily detect any delicious baking scents wafting about and will scurry to their source. In the shadows beyond a kitchen door he awaits his chance to steal some fried bread (laufabraud) and even a cake or two.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-doorway-sniffer_400x.jpg?v=1613136630" }),
    createProduct({ name: 'Gryla', price: 100, description: "Gryla, the mother of the 13 Icelandic Yule lads .According to folklore Gryla has been married three times. Her third husband Leppaludi is said to be living with her in their cave in the Dimmuborgir lava fields, with the big black Yule Cat and their sons. As Christmas approaches, Gryla sets off looking for naughty boys and girls. The Gryla legend has appeared in many stories, poems, songs and plays in Iceland and sometimes Gryla dies at the end of the story.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-gryla_400x.jpg?v=1615865566" }),
    createProduct({ name: 'Gully_Gawk', price: 100, description: "Giljagaur or Gully Gawk (13th Dec.) is the second Yule Lad to make his journey down from the mountains, skulking in and about the deep ravines and gullies .Upon coming to a farm, he slinks into the animal shed to lie in wait for a chance to skim the creamy froth off the milk pail - a cautionary note to those who leave their milk pails unattended!", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-gully-gawk_400x.jpg?v=1613136631" }),
    createProduct({ name: 'Leppaludi', price: 100, description: "Leppaludi, the father of the 13 Icelandic Yule lads. According to folklore Gryla has been married three times. Her third husband Leppalúði is said to be living with her in their cave in the mountains, with the big black Yule Cat and their 13 sons. As Christmas approaches, Gryla sets off looking for naughty boys and girls. The Gryla legend has appeared in many stories, poems, songs and plays in Iceland and sometimes Gryla dies at the end of the story.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-leppaludi_400x.jpg?v=1613136633" }),
    createProduct({ name: 'Meathook', price: 100, description: "Meat Hook or Ketkrokur, was crazy about meat. In the old days he would lower a long stick through the chimney and snag a smoked leg of lamb hanging from the rafters, or a piece of smoked lamb from the pot. In those days the smoked lamb, which is traditional Icelandic Christmas fare, was cooked on St. Thorlak's Day.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-meathook_400x.jpg?v=1613136633" }),
    createProduct({ name: 'Pot_Licker', price: 100, description: "Pottasleikir or Pot Licker (16th Dec.) is the fifth Yule Lad to make his journey down from the mountains. Once he spots a house, he heads straight to the kitchen, and when he is sure that no one is looking he proceeds to lap up all the leftover bits of food in the pots - leading everyone in the household to believe the pots are clean! ", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-pot-licker_400x.jpg?v=1613136632" }),
    createProduct({ name: 'Sausage_Snatcher', price: 100, description: "Bjugnakraekir or Sausage snatcher (20th Dec.) is the nienth Yule Lad to make his way down from the mountains.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-sausage-thief_400x.jpg?v=1615865315" }),
    createProduct({ name: 'Sheep_Code_Clod', price: 100, description: "Stekkjastaur - Sheep Cote Clod / Sheep Worrier. Stekkjarstaur or Sheep Worrier (12th Dec.), the first Icelandic Yule Lad to make his journey down from the mountains. This thirsty lad adores ewes´ milk, much to the consternation of the poor sheep. ", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-sheep-code-clod_400x.jpg?v=1615865315" }),
    createProduct({ name: 'Shorty', price: 100, description: "Stufur or Shorty or Stubby (14th Dec.) is the third Yule Lad to make his way down from the mountains, and a heroic feat it is indeed considering his short legs and the deep snow. For all his effort it is a bit bewildering to discover that once he reaches a dwelling what Stufur really craves is simply the scorched leftovers in unwashed pots!", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-shorty_400x.jpg?v=1613136632" }),
    createProduct({ name: 'Skyr_Glutton', price: 100, description: "Skyrgamur or Skyr Glutton (19th Dec.) is the eighth Yule lad to make his way down from the mountains. Upon coming to a dwelling, he heads straight to the dairy pantry. In the old days Skyr (a calcium-rich dairy product) was stored in large wooden barrels. Skyrgamur would tuck right in and not stop until he reached the bottom - a glutton to be sure, but one with strong bones and teeth! ", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-skyr-glutton_400x.jpg?v=1615865202" }),
    createProduct({ name: 'Spoon_Licker', price: 100, description: "Thvorusleikir or Spoon Licker (15th Dec.) is the fourth Yule Lad to journey down from the mountains. Due to his eccentric longing for only the food residue left on wooden spoons and while even taking into consideration his incredibly muscular tongue, poor Spoon Licker must sneak into many kitchens during the night to satiate his hunger.", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-spoon-licker_400x.jpg?v=1615865202" }),
    createProduct({ name: 'Window_Peeper', price: 100, description: "Gluggagaegir or Window Peeper (21st Dec.) is the tenth Yule Lad to make his journey down from the mountains. Once in town he slinks from window to window, observing in his illegal way the goings-on of town and country folk alike. Over the years he's “seen it all”, twice in fact, as peering so earnestly for such a long time has made his eyes go crossed. If Gluggagægir spies some little knick-knack to his liking, he is not above pilfering it, nor at making ugly faces at anyone who happens to catch him looking in - good reasons to remember to close the curtains and bolt the door on the 21st! ", img: "https://icelandicstore.is/cdn/shop/products/icelandic-yule-lad-window-peeper_400x.jpg?v=1615865201" }),

  
  ]);
  let orders = await fetchOrders();
  let cart = orders.find(order => order.is_cart);
  let lineItem = await createLineItem({ order_id: cart.id, product_id: Bowl_Licker.id});
  lineItem.quantity++;
  await updateLineItem(lineItem);
  cart.is_cart = false;
  await updateOrder(cart);
};

module.exports = {
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  createLineItem,
  updateLineItem,
  // authenticate,
  deleteLineItem,
  updateOrder,
  // findUserByToken
  client
};
