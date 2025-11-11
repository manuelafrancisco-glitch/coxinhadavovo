const STORAGE_KEY = "coxinhaCart_v1";

/* produtos / recomendações — ajuste caminhos se suas imagens estiverem em outra pasta */
const products = [
  { id:"s1", title:"Coxinha de Queijo", price:6.5, img:"fotos/coxinha-queijo.png" },
  { id:"s2", title:"Coxinha Requeijão", price:7.0, img:"fotos/coxinha-requeijao.png" },
  { id:"s3", title:"Coxinha Frango & Catupiry", price:8.0, img:"fotos/coxinha-frango-catupiry.png" },
  { id:"s4", title:"Coxinha Carne Seca", price:8.5, img:"fotos/coxinha-carne-seca.png" },
  { id:"s5", title:"Bolinha de Queijo", price:5.5, img:"fotos/bolinha-queijo.png" },
  { id:"s6", title:"Coxinha Ninho c/ Nutella", price:7.0, img:"fotos/coxinha-ninho-nutella.png" }
];

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }catch{ return []; }
}
function saveCart(cart){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* contador no cabeçalho */
function updateCartCount(){
  const c = loadCart().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById("cart-count");
  if(el) el.textContent = c;
}

/* formato moeda */
function formatMoney(n){ return "R$ " + n.toFixed(2).replace(".",","); }

/* adicionar produto (de recomendados) */
function addToCart(id){
  const cart = loadCart();
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty++;
  else cart.push({ id:p.id, title:p.title, price:p.price, img:p.img, qty:1 });
  saveCart(cart);
  renderCartPage();
}

/* mudar quantidade */
function changeQty(id, delta){
  const cart = loadCart();
  const idx = cart.findIndex(i=>i.id===id);
  if(idx===-1) return;
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  saveCart(cart);
  renderCartPage();
}

/* remover */
function removeItem(id){
  const cart = loadCart().filter(i=>i.id!==id);
  saveCart(cart);
  renderCartPage();
}

/* renderiza lista do carrinho (estilo Amazon) */
function renderCartPage(){
  const list = document.getElementById("cart-list");
  const summary = document.getElementById("cart-summary");
  if(!list || !summary) return;

  const cart = loadCart();
  list.innerHTML = "";
  if(cart.length === 0){
    list.innerHTML = '<div class="empty">Seu carrinho está vazio.</div>';
  } else {
    cart.forEach(item=>{
      const row = document.createElement("div");
      row.className = "cart-item";

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      const img = document.createElement("img");
      img.src = item.img || "";
      img.alt = item.title;
      img.onerror = function(){ this.onerror=null; this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" fill="#999" font-size="18" text-anchor="middle" dominant-baseline="middle">Imagem indisponível</text></svg>`); };
      thumb.appendChild(img);

      const info = document.createElement("div");
      const title = document.createElement("div");
      title.className = "item-title";
      title.textContent = item.title;
      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.textContent = "Quantidade: " + item.qty;
      const controls = document.createElement("div");
      controls.className = "qty-controls";
      const btnMinus = document.createElement("button"); btnMinus.textContent = "-"; btnMinus.onclick = ()=> changeQty(item.id,-1);
      const btnPlus = document.createElement("button"); btnPlus.textContent = "+"; btnPlus.onclick = ()=> changeQty(item.id,1);
      const remove = document.createElement("button"); remove.className="remove-link"; remove.textContent="Remover"; remove.onclick = ()=> removeItem(item.id);
      controls.appendChild(btnMinus); controls.appendChild(btnPlus); controls.appendChild(remove);

      info.appendChild(title); info.appendChild(meta); info.appendChild(controls);

      const price = document.createElement("div");
      price.className = "item-price";
      price.innerHTML = `<div>${formatMoney(item.price * item.qty)}</div><div style="font-size:12px;color:var(--muted);margin-top:6px">R$ ${item.price.toFixed(2).replace('.',',')} cada</div>`;

      row.appendChild(thumb); row.appendChild(info); row.appendChild(price);
      list.appendChild(row);
    });
  }

  /* resumo */
  const subtotal = cart.reduce((s,i)=>s + i.price * i.qty,0);
  summary.innerHTML = `
    <h4>Resumo do pedido</h4>
    <div class="summary-row"><span>Subtotal (${cart.reduce((s,i)=>s+i.qty,0)} itens)</span><strong>${formatMoney(subtotal)}</strong></div>
    <div class="summary-row"><span>Entrega</span><span style="color:var(--muted)">Calculada no próximo passo</span></div>
    <button class="checkout-btn" onclick="checkout()">Fechar pedido</button>
  `;
}

/* render recomendações (cards) */
function renderRecs(){
  const grid = document.getElementById("rec-grid");
  if(!grid) return;
  grid.innerHTML = "";
  products.forEach(p=>{
    const card = document.createElement("div");
    card.className = "rec-card";
    card.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${p.title}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;400&quot; height=&quot;400&quot;><rect width=&quot;100%&quot; height=&quot;100%&quot; fill=&quot;#222&quot;/><text x=&quot;50%&quot; y=&quot;50%&quot; fill=&quot;#999&quot; font-size=&quot;14&quot; text-anchor=&quot;middle&quot; dominant-baseline=&quot;middle&quot;>Imagem</text></svg>')}'></div>
      <h4>${p.title}</h4>
      <div class="price">${formatMoney(p.price)}</div>
      <div class="actions"><button class="button" onclick="addToCart('${p.id}')">Adicionar ao carrinho</button></div>
    `;
    grid.appendChild(card);
  });
}

/* checkout: limpar e voltar pro menu */
function checkout(){
  const cart = loadCart();
  if(cart.length === 0){ alert("Carrinho vazio."); return; }
  alert("Pedido finalizado (simulação). Obrigado!");
  localStorage.removeItem(STORAGE_KEY);
  updateCartCount();
  renderCartPage();
  // redireciona para menu (ou index)
  window.location.href = "menu.html";
}

/* inicialização */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  renderCartPage();
  renderRecs();
});