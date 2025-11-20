/*
 * ESP32 Caesar Cipher Decoder - STABLE VERSION
 * EDUCATIONAL VERSION: Listens for a BLE advertisement containing a Caesar-ciphered
 * string of digits, decrypts it, and sends the original number to the server.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "Pre";
const char* password = "hello@myren";
const char* serverName = "http://172.20.10.4:5000/api/attendance/mark";


const uint16_t manufacturerId = 0xABCD; // The unique ID for our app172.20.10.4
const int CAESAR_SHIFT_KEY = 3; // The secret key for our cipher

// --- RSSI Filter ---
// Adjust this value to tune the range. Closer to 0 = stronger signal (closer).
// -75 dBm is a rough estimate for 4-5 meters.
const int MIN_RSSI = -100; 

// --- BLE Scanner Settings ---
const int scanTimeSeconds = 3;
BLEScan* pBLEScan;

// --- Caesar Cipher Decoding Logic ---
std::string caesar_decrypt(const std::string& encrypted_str) {
    std::string decrypted_str = "";
    for (char c : encrypted_str) {
        if (isdigit(c)) {
            int digit = c - '0'; // Convert char to int
            int decrypted_digit = (digit - CAESAR_SHIFT_KEY + 10) % 10;
            decrypted_str += std::to_string(decrypted_digit);
        } else {
            return ""; // Return empty if any character is not a digit
        }
    }
    return decrypted_str;
}

// --- Callback for Found BLE Devices ---
class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
        if (advertisedDevice.haveManufacturerData()) {
            // *** CORRECTION 1: Added .c_str() ***
            std::string rawData = advertisedDevice.getManufacturerData().c_str();
            
            if (rawData.length() < 2) return;
            uint16_t companyId = (uint8_t)rawData[1] << 8 | (uint8_t)rawData[0];

            if (companyId == manufacturerId) {
                
                // --- ADDED RSSI FILTER ---
                int rssi = advertisedDevice.getRSSI();
                if (rssi < MIN_RSSI) {
                    Serial.printf("Matching device found, but RSSI too weak: %d dBm (Min is %d dBm)\n", rssi, MIN_RSSI);
                    return; // Signal is too weak, ignore this device
                }
                Serial.printf("Matching device found with RSSI: %d dBm\n", rssi);
                // --- END RSSI FILTER ---

                if (rawData.length() > 2) {
                    std::string encrypted_payload = rawData.substr(2);
                    Serial.printf("Found matching packet. Encrypted Payload: %s\n", encrypted_payload.c_str());
                    
                    std::string studentId_str = caesar_decrypt(encrypted_payload);
                    
                    if (!studentId_str.empty()) {
                        Serial.printf("Successfully decoded to Student ID: %s\n", studentId_str.c_str());
                        sendAttendanceToServer(studentId_str.c_str());
                    } else {
                        Serial.println("Decoding failed. Invalid characters in payload.");
                    }
                }
            }
        }
    }

    void sendAttendanceToServer(const char* studentId) {
        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            http.begin(serverName);
            http.addHeader("Content-Type", "application/json");

            // *** CORRECTION 2: Used StaticJsonDocument<256> ***
            StaticJsonDocument<256> doc; // 256 bytes should be plenty
            doc["studentId"] = studentId;

            String jsonPayload;
            serializeJson(doc, jsonPayload);

            Serial.printf("Sending to server: %s\n", jsonPayload.c_str());
            int httpResponseCode = http.POST(jsonPayload);

            if (httpResponseCode > 0) {
                String response = http.getString();
                Serial.printf("Server Response Code: %d\n", httpResponseCode);
                Serial.printf("Server Response Body: %s\n", response.c_str());
            } else {
                Serial.printf("HTTP POST failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
            }
            http.end();
        } else {
            Serial.println("WiFi Disconnected. Cannot send data.");
        }
    }
};

// --- WiFi & Setup ---
void setupWiFi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
        delay(500);
        Serial.print(".");
        retries++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFailed to connect to WiFi. Please check credentials.");
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("Initializing Caesar Cipher ESP32 Scanner...");
    setupWiFi();
    
    BLEDevice::init("");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
}

void loop() {
    Serial.println("\nStarting new scan...");
    pBLEScan->start(scanTimeSeconds, false);
    Serial.println("Scan finished.");
    delay(2000); 
}