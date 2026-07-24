const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const RX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const TX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

const elements = {
  connectButton: document.querySelector("#connectButton"),
  disconnectButton: document.querySelector("#disconnectButton"),
  sendButton: document.querySelector("#sendButton"),
  messageInput: document.querySelector("#messageInput"),
  characterCount: document.querySelector("#characterCount"),
  consoleOutput: document.querySelector("#consoleOutput"),
  headerStatus: document.querySelector("#headerStatus"),
  headerStatusText: document.querySelector("#headerStatusText"),
  deviceName: document.querySelector("#deviceName"),
  deviceState: document.querySelector("#deviceState"),
  oledDot: document.querySelector("#oledDot"),
  oledStatus: document.querySelector("#oledStatus"),
  oledPreview: document.querySelector("#oledPreview"),
  historyList: document.querySelector("#historyList"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  browserWarning: document.querySelector("#browserWarning"),
};

let bluetoothDevice = null;
let gattServer = null;
let rxCharacteristic = null;
let txCharacteristic = null;
let isConnecting = false;
let history = loadHistory();

function supportsWebBluetooth() {
  return "bluetooth" in navigator && window.isSecureContext;
}

function appendLog(message, type = "dim") {
  const line = document.createElement("div");
  line.className = `log-line ${type}`;

  const time = new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  line.textContent = `[${time}] ${message}`;
  elements.consoleOutput.appendChild(line);
  elements.consoleOutput.scrollTop = elements.consoleOutput.scrollHeight;
}

function setConnectionState(connected, name = "RIMAP OLED") {
  elements.headerStatus.dataset.state = connected ? "online" : "offline";
  elements.headerStatusText.textContent = connected ? "ONLINE" : "OFFLINE";
  elements.deviceName.textContent = name || "RIMAP OLED";
  elements.deviceState.textContent = connected ? "CONNECTED" : "IDLE";

  elements.oledDot.classList.toggle("online", connected);
  elements.oledStatus.textContent = connected
    ? "Bilgisayar bagli"
    : "Baglanti bekleniyor";

  elements.connectButton.disabled = connected || !supportsWebBluetooth();
  elements.disconnectButton.disabled = !connected;
  elements.sendButton.disabled = !connected;
}

async function connectToDevice() {
  if (isConnecting || !supportsWebBluetooth()) return;

  try {
    isConnecting = true;
    elements.connectButton.disabled = true;
    elements.connectButton.textContent = "scanning...";

    appendLog("Opening Bluetooth device chooser...", "command");
    appendLog(
      "Select 'RIMAP OLED' from the list. Do not close the chooser.",
      "dim"
    );

    // Filtre kaldırıldı. Böylece adı tarayıcı tarafından henüz
    // okunamayan BLE cihazları da seçim penceresinde görünür.
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [SERVICE_UUID],
    });

    bluetoothDevice.addEventListener(
      "gattserverdisconnected",
      handleDisconnected
    );

    appendLog(
      `Device selected: ${bluetoothDevice.name || "Unnamed BLE device"}`,
      "success"
    );

    if (
      bluetoothDevice.name &&
      !bluetoothDevice.name.toUpperCase().includes("RIMAP")
    ) {
      appendLog(
        "WARNING: Selected device name does not contain RIMAP.",
        "error"
      );
    }

    appendLog("Opening GATT connection...", "command");

    gattServer = await bluetoothDevice.gatt.connect();

    appendLog("Searching for RIMAP UART service...", "command");

    const service = await gattServer.getPrimaryService(SERVICE_UUID);

    rxCharacteristic = await service.getCharacteristic(
      RX_CHARACTERISTIC_UUID
    );

    appendLog("RX characteristic found.", "success");

    try {
      txCharacteristic = await service.getCharacteristic(
        TX_CHARACTERISTIC_UUID
      );

      await txCharacteristic.startNotifications();

      txCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleNotification
      );

      appendLog("TX notifications enabled.", "success");
    } catch (error) {
      txCharacteristic = null;
      appendLog("TX notification channel unavailable.", "dim");
    }

    setConnectionState(true, bluetoothDevice.name || "RIMAP OLED");
    appendLog("BLE connection established.", "success");
  } catch (error) {
    if (error.name === "NotFoundError") {
      appendLog(
        "Device chooser closed without selecting a device.",
        "error"
      );
      appendLog(
        "Keep ESP32 powered and select RIMAP OLED in the Bluetooth window.",
        "dim"
      );
    } else {
      appendLog(readableBluetoothError(error), "error");
    }

    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }

    cleanupConnection();
  } finally {
    isConnecting = false;

    elements.connectButton.textContent = bluetoothDevice?.gatt?.connected
      ? "connected"
      : "connect --device RIMAP";

    if (!bluetoothDevice?.gatt?.connected) {
      elements.connectButton.disabled = !supportsWebBluetooth();
    }
  }
}

function disconnectDevice() {
  appendLog("Disconnect command executed.", "command");

  if (bluetoothDevice?.gatt?.connected) {
    bluetoothDevice.gatt.disconnect();
  } else {
    cleanupConnection();
  }
}

function handleDisconnected() {
  cleanupConnection();
  appendLog("BLE connection closed.", "error");
}

function cleanupConnection() {
  rxCharacteristic = null;
  txCharacteristic = null;
  gattServer = null;
  setConnectionState(false);
  elements.connectButton.textContent = "connect --device RIMAP";
}

async function sendMessage() {
  const message = elements.messageInput.value.trim();

  if (!message) {
    appendLog("ERROR: message buffer is empty.", "error");
    elements.messageInput.focus();
    return;
  }

  if (!rxCharacteristic || !bluetoothDevice?.gatt?.connected) {
    appendLog("ERROR: no active BLE connection.", "error");
    return;
  }

  try {
    elements.sendButton.disabled = true;
    elements.sendButton.textContent = "sending...";

    appendLog(`send --oled "${message}"`, "command");

    const encoder = new TextEncoder();
    const payload = encoder.encode(message);

    // ESP32 kodundaki onWrite her BLE yazımını ayrı mesaj saydığı için
    // mesajı tek işlemde gönderiyoruz. 120 karakter sınırı OLED için yeterli.
    if ("writeValueWithResponse" in rxCharacteristic) {
      await rxCharacteristic.writeValueWithResponse(payload);
    } else {
      await rxCharacteristic.writeValue(payload);
    }

    elements.oledPreview.textContent = message;

    addHistory(message);

    elements.messageInput.value = "";
    updateCounter();

    appendLog(`SUCCESS: ${payload.length} bytes transmitted.`, "success");
  } catch (error) {
    appendLog(readableBluetoothError(error), "error");
  } finally {
    elements.sendButton.disabled = !bluetoothDevice?.gatt?.connected;
    elements.sendButton.textContent = "send --oled";
  }
}

function handleNotification(event) {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(event.target.value);

  if (text) {
    appendLog(`ESP32: ${text}`, "success");
  }
}

function updateCounter() {
  const value = elements.messageInput.value;
  const byteLength = new TextEncoder().encode(value).length;

  elements.characterCount.textContent = String(byteLength);
  elements.oledPreview.textContent =
    value || "Telefondan mesaj bekleniyor...";
}

function addHistory(message) {
  history.unshift({
    message,
    timestamp: Date.now(),
  });

  history = history.slice(0, 10);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    elements.historyList.innerHTML =
      '<div class="history-empty">no history found</div>';
    return;
  }

  elements.historyList.innerHTML = history
    .map((item) => {
      const time = new Date(item.timestamp).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <div class="history-item">
          <div class="history-time">${time}</div>
          <div class="history-message">${escapeHtml(item.message)}</div>
        </div>
      `;
    })
    .join("");
}

function clearHistory() {
  history = [];
  saveHistory();
  renderHistory();
  appendLog("Message history cleared.", "dim");
}

function loadHistory() {
  try {
    const saved = localStorage.getItem("rimap-terminal-history");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem("rimap-terminal-history", JSON.stringify(history));
}

function readableBluetoothError(error) {
  const messages = {
    SecurityError:
      "ERROR: secure context required. Use HTTPS or localhost.",
    NetworkError:
      "ERROR: GATT connection failed. Check that ESP32 is powered and not connected to another device.",
    InvalidStateError:
      "ERROR: Bluetooth state is invalid. Turn Bluetooth off and on.",
    NotSupportedError:
      "ERROR: Web Bluetooth is not supported by this browser.",
  };

  return messages[error.name] || `ERROR: ${error.name}: ${error.message}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

elements.connectButton.addEventListener("click", connectToDevice);
elements.disconnectButton.addEventListener("click", disconnectDevice);
elements.sendButton.addEventListener("click", sendMessage);
elements.clearHistoryButton.addEventListener("click", clearHistory);
elements.messageInput.addEventListener("input", updateCounter);

elements.messageInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    sendMessage();
  }
});

document.querySelectorAll("[data-message]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.messageInput.value = button.dataset.message;
    updateCounter();
    appendLog(`Preset loaded: ${button.textContent}`, "dim");
    elements.messageInput.focus();
  });
});

window.addEventListener("beforeunload", () => {
  if (bluetoothDevice?.gatt?.connected) {
    bluetoothDevice.gatt.disconnect();
  }
});

const supported = supportsWebBluetooth();

elements.browserWarning.hidden = supported;

setConnectionState(false);
elements.connectButton.disabled = !supported;
updateCounter();
renderHistory();

if (!supported) {
  appendLog(
    "WARNING: Web Bluetooth requires Chrome/Edge and HTTPS or localhost.",
    "error"
  );
} else {
  appendLog(
    "Bluetooth chooser will display all nearby BLE devices.",
    "success"
  );
}
