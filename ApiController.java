package com.bestcar;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static final String PHONE = "^[+0-9 ()-]{7,20}$";
    private final Firestore db;
    private final WhatsAppService wa;

    public ApiController(Firestore db, WhatsAppService wa) { this.db = db; this.wa = wa; }

    record Item(@NotBlank @Size(max = 80) String id, @Min(1) @Max(99) int qty) {}

    record OrderReq(@NotBlank @Size(max = 100) String name,
                    @NotBlank @Pattern(regexp = PHONE) String phone,
                    @Size(max = 300) String address,
                    @NotEmpty @Size(max = 30) List<@Valid Item> items) {}

    record BookingReq(@NotBlank @Size(max = 100) String name,
                      @NotBlank @Pattern(regexp = PHONE) String phone,
                      @NotBlank @Size(max = 100) String car,
                      @Size(max = 10) String year,
                      @NotBlank @Size(max = 150) String service,
                      @NotBlank @Size(max = 20) String date,
                      @Size(max = 10) String time,
                      @Size(max = 200) String location,
                      @Size(max = 1000) String notes) {}

    @GetMapping("/health")
    public Map<String, Object> health() { return Map.of("ok", true); }

    /** Prices are read from Firestore here, so the browser can never change them. */
    @PostMapping("/orders")
    public Map<String, Object> order(@Valid @RequestBody OrderReq r) throws Exception {
        List<Map<String, Object>> items = new ArrayList<>();
        StringBuilder lines = new StringBuilder();
        BigDecimal total = BigDecimal.ZERO;
        for (Item i : r.items()) {
            DocumentSnapshot p = db.collection("products").document(i.id()).get().get();
            Object pr = p.get("price");
            if (!p.exists() || !(pr instanceof Number)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown product");
            }
            BigDecimal price = BigDecimal.valueOf(((Number) pr).doubleValue()).setScale(2, RoundingMode.HALF_UP);
            total = total.add(price.multiply(BigDecimal.valueOf(i.qty())));
            items.add(Map.of("id", i.id(), "name", nz(p.getString("name")), "nameAr", nz(p.getString("nameAr")),
                    "price", price.doubleValue(), "qty", i.qty()));
            lines.append(nz(p.getString("name"))).append(" x").append(i.qty()).append(", ");
        }
        Map<String, Object> doc = new HashMap<>();
        doc.put("name", r.name().trim());
        doc.put("phone", r.phone().trim());
        doc.put("address", nz(r.address()));
        doc.put("items", items);
        doc.put("total", total.doubleValue());
        doc.put("status", "new");
        doc.put("createdAt", FieldValue.serverTimestamp());
        String id = db.collection("orders").add(doc).get().getId();
        wa.send(number("whatsappOrders"), "Order " + id.substring(0, 6) + " | " + r.name() + " " + r.phone()
                + " | " + lines + "Total $" + total + " | " + nz(r.address()));
        return Map.of("ok", true, "id", id, "total", total.doubleValue());
    }

    @PostMapping("/bookings")
    public Map<String, Object> booking(@Valid @RequestBody BookingReq r) throws Exception {
        Map<String, Object> doc = new HashMap<>();
        doc.put("name", r.name().trim());
        doc.put("phone", r.phone().trim());
        doc.put("car", r.car());
        doc.put("year", nz(r.year()));
        doc.put("service", r.service());
        doc.put("date", r.date());
        doc.put("time", nz(r.time()));
        doc.put("location", nz(r.location()));
        doc.put("notes", nz(r.notes()));
        doc.put("status", "new");
        doc.put("createdAt", FieldValue.serverTimestamp());
        String id = db.collection("appointments").add(doc).get().getId();
        wa.send(number("whatsappBookings"), "Booking | " + r.name() + " " + r.phone() + " | " + r.car() + " "
                + nz(r.year()) + " | " + r.service() + " | " + r.date() + " " + nz(r.time()) + " | " + nz(r.location())
                + " | " + nz(r.notes()));
        return Map.of("ok", true, "id", id);
    }

    private String number(String key) throws Exception {
        DocumentSnapshot s = db.collection("settings").document("site").get().get();
        String v = s.getString(key);
        if (v == null || v.isBlank()) v = s.getString("whatsapp");
        return v == null ? "" : v.replaceAll("\\D", "");
    }

    private static String nz(String s) { return s == null ? "" : s.trim(); }
}
