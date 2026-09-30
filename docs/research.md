# Investigación: costo de impresión 3D en Uruguay (Bambu Lab A1)

Recopilación de toda la investigación hecha el 24/09/2026 para calcular el costo real de las impresiones 3D y construir la calculadora.

## Resumen

- **Filamento:** se relevaron dos tiendas de Montevideo, Proyecto Color (16 filamentos) y Macrotec (92). Las dos publican los precios **en dólares** y ninguna aclara si incluyen IVA. El PLA básico de 1 kg anda entre US$ 15,50 y 17.
- **Luz:** la A1 no gasta parejo. Al calentar la cama llega a ~1114 W, en el arranque ronda los ~120 W y mientras imprime PLA promedia **95 W**. En una impresión larga la luz es entre el 5 y el 9 % del costo; en una corta, el calentamiento pesa bastante más.
- **Tarifa:** con UTE Triple Horario, la franja punta (17–23 h en días hábiles) cuesta casi 5 veces más que la valle (00–07 h).
- **Diseño:** las fuentes de diseño (oficiales y de la comunidad) coinciden en algo concreto para el celular:
  - botones de 44–48 px o más;
  - letra de 16 px o más en los campos;
  - tarjetas en vez de tablas anchas;
  - los totales al alcance del pulgar;
  - animaciones cortas, de 100–400 ms.

---

## 1. Tarifa UTE y tipo de cambio

**Tarifa Residencial Triple Horario** (pliego vigente desde el 01/01/2026):

| Franja | Horario, días hábiles | Sin IVA | Con IVA (22 %) |
|---|---|---|---|
| Valle | 00:00–07:00 | $2,443 | **$2,9805** |
| Llano | 07:00–17:00 y 23:00–24:00 | $5,172 | **$6,3098** |
| Punta | 17:00–23:00 | $12,034 | **$14,6815** |

- Los fines de semana y feriados no hay punta: de 07:00 a 24:00 se cobra llano.
- **Dólar de referencia:** $41,35 (BROU, billete venta, 24/09/2026).
- Fuentes: [UTE – Pliego Tarifario Enero 2026](https://www.ute.com.uy/sites/default/files/docs/Pliego%20Tarifario%20Enero%202026.pdf) · [BROU – Cotizaciones](https://brou.com.uy/en/cotizaciones)

---

## 2. Precios de filamentos

### Cómo se relevó

- **Proyecto Color:** la tienda está en **proyectocolor.uy**; proyectocolor.com no carga. Se revisó la categoría Insumos 3D › Filamento 3D: 18 productos, 16 para impresora y 2 packs para lápiz 3D.
- **Macrotec:** Dr. Enrique Tarigo 1168, Plaza Cagancha, Montevideo. Tel. 2900 7498. Se revisaron las 2 páginas de la categoría Filamentos: 92 productos, 90 para impresora y 2 para lápiz 3D.

### Qué encontramos

- **Moneda:** las dos tiendas cobran en dólares. Proyecto Color descuenta un 5 % si pagás en un solo pago.
- **El más barato por gramo:** el PLA+ 3nMax de 1 kg en Macrotec, a US$ 15,50 (0,0155 US$/g).
- **Mismo producto, mismo precio:** el PLA 3N3 de 1 kg cuesta US$ 16,50 en las dos tiendas.
- **Rollos que no son de 1 kg:**
  - ABS Fremover: 800 g
  - PLA 3n3: 500 g
  - PLA+ 3nMax SE: 750 g
  - PPS-CF Bambu: 750 g
  - Soportes Bambu y PVA: 500 g
  - Grilon3: rollos de 2,5 y 4 kg
- **Stock:** varía según el color. El ABS Fremover figuraba sin stock.
- **Lápiz 3D:** esos packs se venden por metro, no por gramo, así que no entran en el cálculo.
  - Proyecto Color: PLA y PCL, US$ 5–7 por 50 o 100 m.
  - Macrotec: PCL Creality 10 × 5 m a US$ 3 (antes 9) y Grilon3 PLA 20 colores × 10 m a US$ 25.

### Precios completos (sin los packs de lápiz 3D)

### Proyecto Color

| Grupo | Producto | Peso | US$ | US$/g |
|---|---|---|---|---|
| PLA y PLA+ | 3N3 PLA 1 kg | 1.000 g | 16,50 | 0,0165 |
| PLA y PLA+ | Fremover PLA+ 1 kg | 1.000 g | 16,50 | 0,0165 |
| PLA y PLA+ | Fremover PLA+ 1 kg sin caja (desde) | 1.000 g | 16,00 | 0,0160 |
| PLA y PLA+ | GST PLA+ Black Edition 1 kg | 1.000 g | 16,50 | 0,0165 |
| PLA y PLA+ | Fremover PLA+ High Speed 1 kg | 1.000 g | 16,00 | 0,0160 |
| PLA y PLA+ | Fremover PLA+ART High Speed 1 kg | 1.000 g | 16,00 | 0,0160 |
| PLA y PLA+ | Filanova PLA+ High Speed 1 kg | 1.000 g | 16,50 | 0,0165 |
| PLA especiales | Fremover PLA+ HS Silk 1 kg | 1.000 g | 18,00 | 0,0180 |
| PLA especiales | Fremover PLA+ HS Dual Silk 1 kg | 1.000 g | 19,00 | 0,0190 |
| PLA especiales | Fremover PLA+ HS Tri-Color Silk 1 kg | 1.000 g | 19,00 | 0,0190 |
| PLA especiales | Fremover PLA+ HS Mármol 1 kg | 1.000 g | 19,00 | 0,0190 |
| PLA especiales | Fremover PLA+ HS Silk Rainbow 1 kg | 1.000 g | 20,00 | 0,0200 |
| PLA especiales | Fremover PLA+ HS Glow 1 kg | 1.000 g | 24,00 | 0,0240 |
| PLA especiales | Fremover PLA Wood HS 1 kg | 1.000 g | 27,00 | 0,0270 |
| PETG | Fremover PETG High Speed 1 kg | 1.000 g | 17,00 | 0,0170 |
| ABS | Fremover ABS High Speed 800 g | 800 g | 17,00 | 0,0213 |

### Macrotec

| Grupo | Producto | Peso | US$ | US$/g |
|---|---|---|---|---|
| PLA y PLA+ | PLA 3n3 500g | 500 g | 9,00 | 0,0180 |
| PLA y PLA+ | PLA+ 3nMax SE 750g | 750 g | 11,90 | 0,0159 |
| PLA y PLA+ | PLA+ 3nMax 1kg | 1.000 g | 15,50 | 0,0155 |
| PLA y PLA+ | PLA 3n3 1kg | 1.000 g | 16,50 | 0,0165 |
| PLA y PLA+ | Ultra PLA Creality Soleyin 1kg | 1.000 g | 17,00 | 0,0170 |
| PLA y PLA+ | PLA Basic Flashforge 1 kg | 1.000 g | 17,00 | 0,0170 |
| PLA y PLA+ | PLA Lite Bambu Lab sin Carrete (Refill) 1kg | 1.000 g | 17,00 | 0,0170 |
| PLA y PLA+ | Ender PLA+ Creality 1KG | 1.000 g | 19,00 | 0,0190 |
| PLA y PLA+ | PLA Creality Ender Fast 1Kg | 1.000 g | 21,00 | 0,0210 |
| PLA y PLA+ | PLA Basic Bambu Lab sin Carrete (Refill) 1kg | 1.000 g | 21,00 | 0,0210 |
| PLA y PLA+ | PLA Grilon3 1kg | 1.000 g | 23,00 | 0,0230 |
| PLA y PLA+ | PLA Creality Hyper RFID 1kg | 1.000 g | 23,00 | 0,0230 |
| PLA y PLA+ | PLA Creality Hyper 1kg | 1.000 g | 23,00 | 0,0230 |
| PLA y PLA+ | Ultra PLA Creality Soleyin Nuevos Colores 1kg | 1.000 g | 23,00 | 0,0230 |
| PLA y PLA+ | PLA Lite Bambu Lab con Carrete Reusable 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA y PLA+ | PLA Creality CR 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA y PLA+ | PLA+ PLA 850 Grilon3 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA y PLA+ | PLA Basic Bambu Lab con Carrete Reusable 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA y PLA+ | PLA Pro Hyper Grilon3 1kg | 1.000 g | 25,00 | 0,0250 |
| PLA y PLA+ | PLA Astra Grilon3 1kg | 1.000 g | 25,00 | 0,0250 |
| PLA y PLA+ | PLA Zeta Grilon3 1kg | 1.000 g | 25,00 | 0,0250 |
| PLA y PLA+ | PLA+ PLA 870 Grilon3 1kg | 1.000 g | 32,00 | 0,0320 |
| PLA y PLA+ | Ultra PLA Creality & BASF 1kg | 1.000 g | 39,00 | 0,0390 |
| PLA especiales | PLA Matte Flashforge 1 kg | 1.000 g | 17,00 | 0,0170 |
| PLA especiales | PLA Matte Bambu Lab Refill 1kg | 1.000 g | 21,00 | 0,0210 |
| PLA especiales | PLA Boutique Grilon3 1kg | 1.000 g | 23,00 | 0,0230 |
| PLA especiales | PLA Hyper Creality Arcoíris 1KG | 1.000 g | 23,00 | 0,0230 |
| PLA especiales | PLA Creality CR Mate 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA especiales | PLA Matte Bambu Lab con Carrete Reusable 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA especiales | PLA Creality Fluorescente 1KG | 1.000 g | 24,00 | 0,0240 |
| PLA especiales | PLA Silk 3N3 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA especiales | PLA Translúcido Bambu Lab con Carrete 1kg | 1.000 g | 24,00 | 0,0240 |
| PLA especiales | PLA Metal Bambu Lab con Carrete 1kg | 1.000 g | 26,00 | 0,0260 |
| PLA especiales | PLA Silk Seda Creality 1kg | 1.000 g | 27,00 | 0,0270 |
| PLA especiales | PLA Silk Seda Grilon3 Dorado 1kg | 1.000 g | 27,00 | 0,0270 |
| PLA especiales | PLA Silk Seda Grilon3 1kg | 1.000 g | 27,00 | 0,0270 |
| PLA especiales | PLA Silk+ Bambu Lab con Carrete 1kg | 1.000 g | 28,00 | 0,0280 |
| PLA especiales | PLA Basic Gradient Bambu Lab con Carrete Reusable 1kg | 1.000 g | 29,00 | 0,0290 |
| PLA especiales | PLA Creality Hyper RFID Stardust 1kg | 1.000 g | 29,00 | 0,0290 |
| PLA especiales | PLA Silk Seda Dual Creality 1kg | 1.000 g | 30,00 | 0,0300 |
| PLA especiales | PLA Marble Bambu Lab con Carrete 1kg | 1.000 g | 31,00 | 0,0310 |
| PLA especiales | PLA Wood Madera Grilon3 1kg | 1.000 g | 34,00 | 0,0340 |
| PLA especiales | PLA Galaxy Bambu Lab con Carrete 1kg | 1.000 g | 35,00 | 0,0350 |
| PLA especiales | PLA Silk Bambu Lab con Carrete Reusable 1kg | 1.000 g | 35,00 | 0,0350 |
| PLA especiales | PLA Wood Bambu Lab con Carrete Reusable 1kg | 1.000 g | 36,00 | 0,0360 |
| PLA especiales | PLA Sparkle Bambu Lab con Carrete Reusable 1kg | 1.000 g | 39,00 | 0,0390 |
| PLA especiales | PLA Creality Hyper Foamed 1kg | 1.000 g | 52,00 | 0,0520 |
| PLA especiales | PLA Aero Bambu Lab con Carrete Reusable 1kg | 1.000 g | 59,00 | 0,0590 |
| PETG / PET | EPET 3n3 1kg | 1.000 g | 16,00 | 0,0160 |
| PETG / PET | PETG 3N3 1kg | 1.000 g | 18,00 | 0,0180 |
| PETG / PET | CR-PETG Creality 1KG | 1.000 g | 21,00 | 0,0210 |
| PETG / PET | PETG Creality CR 1kg | 1.000 g | 21,00 | 0,0210 |
| PETG / PET | PETG Grilon3 1kg | 1.000 g | 21,00 | 0,0210 |
| PETG / PET | AdPETG Tough Mingda Translúcido 1kg | 1.000 g | 27,00 | 0,0270 |
| PETG / PET | AdPETG Tough Mingda Bloqueador Luz 1kg | 1.000 g | 27,00 | 0,0270 |
| PETG / PET | PETG Translúcido Bambu Lab con Carrete Reusable 1kg | 1.000 g | 29,00 | 0,0290 |
| PETG / PET | PETG HF Bambu Lab con Carrete 1kg | 1.000 g | 35,00 | 0,0350 |
| ABS, ASA y HIPS | HIPS Grilon3 1kg | 1.000 g | 19,00 | 0,0190 |
| ABS, ASA y HIPS | ABS Creality CR 1kg | 1.000 g | 24,00 | 0,0240 |
| ABS, ASA y HIPS | ABS Grilon3 1kg | 1.000 g | 24,00 | 0,0240 |
| ABS, ASA y HIPS | ABS Bambu Lab con Carrete Reusable 1kg | 1.000 g | 29,00 | 0,0290 |
| ABS, ASA y HIPS | ASA Aero Bambu Lab con Carrete Reusable 1kg | 1.000 g | 75,00 | 0,0750 |
| Flexibles (TPU) | Flexible PLA+ 3nFlex 1kg | 1.000 g | 28,00 | 0,0280 |
| Flexibles (TPU) | Flexible TPU 3N3 1kg | 1.000 g | 34,00 | 0,0340 |
| Flexibles (TPU) | Flexible TPU Creality CR 1kg | 1.000 g | 36,00 | 0,0360 |
| Flexibles (TPU) | Flexible Simpliflex Grilon3 1kg | 1.000 g | 42,00 | 0,0420 |
| Flexibles (TPU) | HP-TPU Creality 1kg | 1.000 g | 46,00 | 0,0460 |
| Flexibles (TPU) | TPU para AMS Bambu Lab con Carrete Reusable 1kg | 1.000 g | 49,00 | 0,0490 |
| Técnicos | PP-T Grilon3 1kg | 1.000 g | 25,00 | 0,0250 |
| Técnicos | Nylon 6 Grilon3 1kg | 1.000 g | 29,00 | 0,0290 |
| Técnicos | PLA-CF Bambu Lab con Carrete 1kg | 1.000 g | 35,00 | 0,0350 |
| Técnicos | PLA-CF Creality Hyper 1kg | 1.000 g | 39,00 | 0,0390 |
| Técnicos | Acetal Grilon3 1kg | 1.000 g | 47,00 | 0,0470 |
| Técnicos | PC Bambu Lab con Carrete 1kg | 1.000 g | 55,00 | 0,0550 |
| Técnicos | PA6-GF Bambu Lab con Carrete 1kg | 1.000 g | 59,00 | 0,0590 |
| Técnicos | Nylon 12 Grilon3 1kg | 1.000 g | 69,00 | 0,0690 |
| Técnicos | PC FR Bambu Lab con Carrete Reusable 1kg | 1.000 g | 75,00 | 0,0750 |
| Técnicos | PA6-CF Bambu Lab con Carrete 1kg | 1.000 g | 79,00 | 0,0790 |
| Técnicos | PET-CF Bambu Lab con Carrete 1kg | 1.000 g | 85,00 | 0,0850 |
| Técnicos | PA612-CF Creality Hyper 1kg | 1.000 g | 89,00 | 0,0890 |
| Técnicos | PPS-CF Bambu Lab con Carrete 750gr | 750 g | 117,00 | 0,1560 |
| Materiales de soporte | Soporte para ABS Bambu Lab con Carrete Reusable 500grs | 500 g | 25,00 | 0,0500 |
| Materiales de soporte | Soporte para PLA / PETG Bambu Lab con Carrete Reusable 500grs | 500 g | 49,00 | 0,0980 |
| Materiales de soporte | PVA Grilon3 Natural 500gr | 500 g | 63,00 | 0,1260 |
| Rollos grandes | PETG Grilon3 2.5kg | 2.500 g | 47,00 | 0,0188 |
| Rollos grandes | PLA+ PLA 850 Grilon3 2.5kg | 2.500 g | 56,00 | 0,0224 |
| Rollos grandes | ABS Grilon3 2.5kg | 2.500 g | 56,00 | 0,0224 |
| Rollos grandes | PETG Grilon3 4kg | 4.000 g | 76,00 | 0,0190 |
| Rollos grandes | Boutique Grilon3 4kg | 4.000 g | 82,00 | 0,0205 |
| Rollos grandes | PLA Grilon3 4kg | 4.000 g | 82,00 | 0,0205 |
Fuentes: [Proyecto Color – Filamento 3D](https://proyectocolor.uy/categorias/insumos-3d/filamento-3d/) · [Macrotec – Filamentos p. 1](https://www.macrotec.com.uy/filamentos) · [Macrotec – p. 2](https://www.macrotec.com.uy/filamentos?pagenumber=2) · [Macrotec – Dirección](https://www.macrotec.com.uy/direccionytel)

---

## 3. Consumo eléctrico de la Bambu Lab A1

### Cómo se investigó

- Se usaron dos agentes, los dos en Haiku, con fuentes separadas:
  - uno solo con fuentes **oficiales**: bambulab.com, wiki.bambulab.com;
  - otro solo con fuentes **anecdóticas**: foro de Bambu, Reddit, reseñas.
- Después verifiqué las fuentes clave a mano.

### Datos oficiales (Bambu Lab)

| Dato | Valor | Fuente |
|---|---|---|
| Reposo (encendida, sin imprimir) | 4–5,4 W | [Wiki – Power consumption](https://wiki.bambulab.com/en/general/power-consumption) |
| PLA, promedio imprimiendo | **95 W** (0,025–0,028 kWh en 16 min 58 s) | ídem |
| ABS, promedio | 200 W | ídem |
| PC, promedio | 150 W | ídem |
| Factor de potencia | 0,41–0,64 | ídem |
| Potencia máxima | 1300 W @220 V / 350 W @110 V | [bambulab.com – A1 specs](https://bambulab.com/en/a1/tech-specs) |
| Resistencia del calentador de cama | 45–50 Ω (47,5 Ω medidos) | [Wiki – Heatbed A1](https://wiki.bambulab.com/en/a1/troubleshooting/heatbed-not-heat-up) |
| Temperaturas máximas | boquilla 300 °C, cama 100 °C | [Wiki – A1 FAQ](https://wiki.bambulab.com/en/a1/manual/faq) |

**Lo que Bambu Lab no publica:**
- cuánto tarda en calentar la cama o la boquilla;
- cuánto dura la calibración del arranque;
- cuánto consume en cada fase;
- el consumo del AMS lite.

### Datos anecdóticos (verificados)

- **Pico de la cama:** ~**1000 W** en 220 V mientras sube desde temperatura ambiente. Una vez que llega, se mantiene con ~**120 W**. Calentando de a 3 °C por vez se puede bajar el pico a ~350 W. ([Foro – pico de la cama A1](https://forum.bambulab.com/t/the-peak-power-of-bambu-a1-hot-bed-is-too-high-and-uncontrollable/99430))
- **Arranque:** la secuencia de inicio dura **~4 min** aunque se desactive la nivelación. ([Foro – start sequence](https://forum.bambulab.com/t/start-sequence-way-too-long-and-redundant/123733))
- **Impresión PLA:** un usuario midió 70–80 W de promedio, con mínimos de ~30 W y picos de 119 W. En 120 V la cama calentando llega a ~300 W. ([Foro – consumo A1](https://forum.bambulab.com/t/power-consumption-for-a1-printer/92095))
- **Call3D:** da 1100 W de arranque de cama, 70 W de boquilla y 8–10 W en espera, pero no dice cómo midió. ([Call3D](https://call-3d.com/blogs/upgrades/bambu-lab-power-consumption-review))

### Fuentes descartadas

- **Artículos "wiki" de AliExpress:** dicen 120–180 W imprimiendo y 0,75 kWh en 5 h, pero no explican el método y parecen generados automáticamente.
- **Reseña de 3dprintbeginner:** midió la **A1 mini**, no la A1.

### Verificación cruzada

- **Potencia de la cama a 230 V:** 230² ÷ 47,5 Ω = **1113,68 W**. Coincide con los ~1000 W medidos en 220 V (220² ÷ 47,5 = 1019 W).
- **El test oficial no incluye calentar la cama.** En 17 minutos consumió 25–28 Wh, y un calentamiento de 2 min a 1100 W ya son ~37 Wh. Por eso el arranque se suma aparte sin contarlo dos veces.

### Modelo de consumo que usa la calculadora

| Fase | Consumo | Duración | Tipo de dato |
|---|---|---|---|
| Calentando cama | V² ÷ R = 1113,68 W | 2 min | resistencia oficial, duración **ESTIMADA** |
| Arranque y calibración | 120 W | 4 min | foro |
| Imprimiendo | 95 W (PLA) / 200 W (ABS, ASA) / 150 W (PC) | resto del tiempo | oficial |

- El arranque se descuenta de la duración total: la hora de fin no cambia.
- PETG, TPU y nylon no tienen dato oficial y usan el valor de PLA. Seguramente se queda corto para el PETG.
- **Ejemplo:** placa de 10 h que arranca a las 23:00 en día hábil. Consume 0,9856 kWh y gasta $4,01 de luz; con 95 W planos daría 0,95 kWh y $3,78.
- **Pendiente:** medir la A1 real con un medidor de enchufe, sobre todo el tiempo de calentamiento de la cama.

---

## 4. Ejemplo calculado: ajedrez medieval (2 placas)

- **Datos:** 103 g por placa, 10 h cada una, Fremover PLA+ HS a US$ 16 por 1 kg ($0,6616/g).

| Placa | Inicio | Energía | Filamento | Total |
|---|---|---|---|---|
| 1 | jue 23:00 | $4,01 | $68,14 | $72,15 |
| 2 | vie 11:00 | $9,40 | $68,14 | $77,55 |
| **Proyecto** | | **$13,41** | **$136,28** | **$149,70** |

- El filamento es ~91 % del costo.
- La placa 2 paga 4 h de punta: ese día costaba menos arrancar a las 00:00.
- Con 95 W planos daba $149,25.

---

## 5. Diseño y experiencia de uso en el celular

### Cómo se investigó

- Otra vez dos agentes, los dos en Haiku, con fuentes separadas:
  - uno **oficial**: Apple HIG, Google web.dev / Material, Nielsen Norman Group, Baymard, WCAG;
  - otro **anecdótico**: Reddit, Hacker News, CSS-Tricks, Smashing Magazine, blogs de diseñadores.
- A eso se sumó la revisión con las guías de Apple (skill apple-design).

### Reglas oficiales

- **Botones y zonas táctiles:**
  - WCAG pide un mínimo de 24 × 24 px; web.dev recomienda 48 × 48 px, con 8 px entre uno y otro. ([web.dev](https://web.dev/articles/accessible-tap-targets), [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
  - Apple recomienda 44 × 44 pt en el teléfono (mínimo 28) y 28 × 28 pt en la computadora (mínimo 20). (HIG `accessibility.md › Mobility`)
- **Campos de texto:**
  - letra de al menos 16 px, para que el iPhone no haga zoom;
  - usar `inputmode` numérico: con el teclado numérico las teclas quedan 521 % más grandes. ([web.dev forms](https://web.dev/learn/forms/design-basics), [Baymard](https://baymard.com/labs/touch-keyboard-types))
- **Contraste:** 4,5:1 para texto de hasta 17 pt y 3:1 para texto grande o en negrita. No transmitir información solo con color. (HIG `accessibility.md › Vision`, `color.md`)
- **Diseño:**
  - una sola columna en el celular;
  - nunca desplazamiento horizontal;
  - lo más importante arriba, y el resto con divulgación progresiva. ([web.dev RWD](https://web.dev/articles/responsive-web-design-basics), HIG `layout.md`)
- **Tablas:** en el celular funcionan mejor las tarjetas que las tablas anchas. ([NN/g – Cards](https://www.nngroup.com/articles/cards-component/))
- **Hojas inferiores:** cerrar deslizando hacia abajo **y además** con un botón visible, y usarlas solo para tareas secundarias. ([NN/g – Bottom sheets](https://www.nngroup.com/articles/bottom-sheet/))
- **Animación:**
  - Duraciones: ~100 ms para respuestas simples, 200–300 ms para cambios de pantalla, y nunca más de 400–500 ms. ([NN/g – Animation duration](https://www.nngroup.com/articles/animation-duration/))
  - Curva ease-out por defecto; animar solo `transform` y `opacity`; respetar `prefers-reduced-motion`. ([web.dev – easing](https://web.dev/choosing-the-right-easing/), [web.dev – performance](https://web.dev/animations-and-performance/))
- **Liquid Glass (Apple):**
  - el vidrio va solo en la capa de controles flotantes, nunca en el contenido, y con moderación;
  - con Reduce Transparency, pasar a fondos opacos;
  - color de acento solo para la acción principal. (HIG `liquid-glass.md`, `materials.md`)
- **Avisos:** evitar elementos que se cierran solos por tiempo, sobre todo si tienen "Deshacer". (HIG `accessibility.md › Cognitive`)
- **Rendimiento:** INP ≤ 200 ms, CLS ≤ 0,1, LCP ≤ 2,5 s. ([web.dev – Vitals](https://web.dev/articles/vitals))

### Lo que dice la comunidad

- **Quejas más comunes:**
  - el teclado tapa los botones fijos abajo;
  - zoom al tocar campos con letra de menos de 16 px;
  - el bug de `100vh` (se usa `100dvh`);
  - el scroll y los gestos del navegador que se disparan sin querer. ([CSS-Tricks](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/), [HN](https://news.ycombinator.com/item?id=43522181))
- **Lo que se siente "premium":**
  - respuesta visible al tocar;
  - interacciones con física, que reaccionan durante el gesto;
  - números grandes y claros;
  - una sola acción principal;
  - mostrar la información solo cuando importa. ([Every – Invisible details](https://every.to/p/invisible-details-of-interaction-design), [UX Collective](https://bootcamp.uxdesign.cc/how-i-designed-published-subtle-a-gorgeous-calculator-3f482d11a80a))
- **Animación:**
  - 200–400 ms en total;
  - no animar lo que se toca muchas veces seguidas;
  - números que cuentan hasta el valor nuevo;
  - solo `transform` y `opacity`. ([CSS-Tricks – Ground rules](https://css-tricks.com/ground-rules-for-web-animations/))
- **Totales:** el número clave, grande (32–40 px o más) y siempre visible. Que se note que los datos ingresados se registraron.

### Qué se aplicó en la calculadora

- Diseño pensado primero para el celular, sin desplazamiento horizontal.
- Un dock inferior de vidrio con el costo y el peso de la impresión, el total del proyecto y el botón "+". Se esconde mientras está el teclado abierto.
- El resultado va primero; el paso a paso y el resumen son tarjetas apiladas.
- Campos de 17 px con teclado numérico, y botones de 44 px en pantallas táctiles.
- Hojas inferiores que se cierran deslizando o con botón, con buscador, filtro por tienda y búsquedas rápidas.
- **Firma visual:** un reloj de 24 h con las franjas de UTE y el arco de la impresión.
- **Animaciones:**
  - las tarjetas entran escalonadas al abrir;
  - los números cuentan hasta el valor nuevo;
  - el arco del reloj gira y las barras de franja se estiran;
  - los botones se achican al tocarlos y las pestañas nuevas aparecen con un rebote;
  - todo se apaga con "Reducir movimiento".
- **Accesibilidad:**
  - el chip "Llano" pasó de texto blanco (2,6:1) a texto oscuro;
  - las franjas llevan letra (V, L, P) además del color;
  - el aviso con "Deshacer" ya no se cierra solo;
  - el reloj tiene una descripción para lectores de pantalla.

---

## 6. Documentos relacionados en el proyecto

- `precios-filamentos-proyectocolor.md`
- `precios-filamentos-macrotec.md`
- `consumo-bambu-a1.md`
- `costo-impresion-3d-ajedrez-medieval.md`
- Calculadora publicada como artefacto: "Costo de Impresión A1"
