// 見積書フォーム: 明細行の追加・削除とリアルタイム金額計算
// (Next.js版 src/lib/estimate-calc.ts のロジックを踏襲)

function calculateEstimateAmounts(items, taxRate, taxType) {
  var itemsTotal = 0;
  items.forEach(function (item) {
    itemsTotal += Math.round((item.quantity || 0) * (item.unitPrice || 0));
  });

  if (taxType === "INCLUSIVE") {
    var totalAmount = itemsTotal;
    var taxAmount = Math.round(totalAmount - totalAmount / (1 + taxRate / 100));
    var subtotal = totalAmount - taxAmount;
    return { subtotal: subtotal, taxAmount: taxAmount, totalAmount: totalAmount };
  }

  var subtotal2 = itemsTotal;
  var taxAmount2 = Math.round(subtotal2 * (taxRate / 100));
  var totalAmount2 = subtotal2 + taxAmount2;
  return { subtotal: subtotal2, taxAmount: taxAmount2, totalAmount: totalAmount2 };
}

function formatYen(n) {
  return Math.round(n).toLocaleString("ja-JP") + "円";
}

document.addEventListener("DOMContentLoaded", function () {
  var itemsTable = document.getElementById("estimate-items-table");
  if (!itemsTable) return;

  var tbody = itemsTable.querySelector("tbody");
  var addBtn = document.getElementById("add-item-row");
  var taxRateInput = document.getElementById("taxRate");
  var taxTypeSelect = document.getElementById("taxType");
  var subtotalEl = document.getElementById("summary-subtotal");
  var taxAmountEl = document.getElementById("summary-tax");
  var totalAmountEl = document.getElementById("summary-total");

  var rowIndex = tbody.querySelectorAll("tr").length;

  function rowTemplate(index) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td><input type="text" name="items[' + index + '][name]"></td>' +
      '<td><input type="number" step="0.01" name="items[' + index + '][quantity]" value="1" class="qty-input"></td>' +
      '<td><input type="text" name="items[' + index + '][unit]"></td>' +
      '<td><input type="number" step="1" name="items[' + index + '][unit_price]" value="0" class="price-input"></td>' +
      '<td class="num row-amount">0円</td>' +
      '<td><button type="button" class="btn btn-ghost btn-sm remove-row">削除</button></td>';
    return tr;
  }

  function recalc() {
    var items = [];
    tbody.querySelectorAll("tr").forEach(function (tr) {
      var qty = parseFloat(tr.querySelector(".qty-input").value) || 0;
      var price = parseFloat(tr.querySelector(".price-input").value) || 0;
      tr.querySelector(".row-amount").textContent = formatYen(Math.round(qty * price));
      items.push({ quantity: qty, unitPrice: price });
    });
    var taxRate = parseFloat(taxRateInput.value) || 0;
    var taxType = taxTypeSelect.value;
    var result = calculateEstimateAmounts(items, taxRate, taxType);
    subtotalEl.textContent = formatYen(result.subtotal);
    taxAmountEl.textContent = formatYen(result.taxAmount);
    totalAmountEl.textContent = formatYen(result.totalAmount);
  }

  addBtn.addEventListener("click", function () {
    tbody.appendChild(rowTemplate(rowIndex));
    rowIndex++;
    recalc();
  });

  tbody.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-row")) {
      if (tbody.querySelectorAll("tr").length <= 1) {
        alert("明細は1件以上必要です");
        return;
      }
      e.target.closest("tr").remove();
      recalc();
    }
  });

  tbody.addEventListener("input", recalc);
  taxRateInput.addEventListener("input", recalc);
  taxTypeSelect.addEventListener("change", recalc);

  recalc();
});
