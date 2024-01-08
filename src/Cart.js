import React from 'react';

const Cart = ({ updateOrder, removeFromCart, lineItems, cart, products, removeOne, addOne })=> {
  
  const sum = lineItems.reduce((accumlator, lineItem) => {
    const findProduct = products.find((product) => {
      return product.id === lineItem.product_id
    })
    if(cart.id === lineItem.order_id) {
      accumlator += findProduct.price * lineItem.quantity /100
    }
    return accumlator
  }, 0)
  
  return (
    <div>
      <h2>Cart</h2>
      <ul>
        {
          lineItems.filter((lineItem) => {return lineItem.order_id === cart.id}).map( lineItem => {
            const product = products.find(product => product.id === lineItem.product_id) || {};
            return (
              <li key={ lineItem.id }>
                { product.name }
                ({ lineItem.quantity })
                <button onClick={ () => addOne(lineItem)}>Add One</button>
                { lineItem.quantity > 1 ? 
                  <button onClick={ () => removeOne(lineItem)}>Remove One</button> 
                :<button onClick={ ()=> removeFromCart(lineItem)}>Remove From Cart</button>
                }
              </li>
            );
          })
        }
      </ul>
      {sum*1 === 0 ? <h2>Add some items to your cart to get started.</h2> : <h2>Total: ${sum}</h2> }
      {
        lineItems.filter((lineItem) => {return lineItem.order_id === cart.id }).length ? <button onClick={()=> {
          updateOrder({...cart, is_cart: false });
        }}>Create Order</button>: null
      }
    </div>
  );
};

export default Cart;
