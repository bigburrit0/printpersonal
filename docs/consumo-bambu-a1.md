# Consumo eléctrico de la Bambu Lab A1 por fase

Investigación del 24/09/2026. Se usaron fuentes oficiales y del foro por separado. Estos son los valores que usa la calculadora.

| Fase | Consumo | Duración | Tipo de dato | Fuente |
|---|---|---|---|---|
| Reposo (encendida, sin imprimir) | 4–5,4 W | — | Oficial | [Wiki Bambu – Power consumption](https://wiki.bambulab.com/en/general/power-consumption) |
| Calentamiento de cama | 230² ÷ 47,5 Ω = **1113,68 W** (≈1000 W medidos en 220 V) | **2 min** | Resistencia oficial / duración ESTIMADA | [Wiki – Heatbed A1](https://wiki.bambulab.com/en/a1/troubleshooting/heatbed-not-heat-up), [Foro – pico de la cama](https://forum.bambulab.com/t/the-peak-power-of-bambu-a1-hot-bed-is-too-high-and-uncontrollable/99430) |
| Arranque y calibración (cama ya caliente) | ~120 W | ~4 min | Foro | [Foro – pico de la cama](https://forum.bambulab.com/t/the-peak-power-of-bambu-a1-hot-bed-is-too-high-and-uncontrollable/99430), [Foro – start sequence](https://forum.bambulab.com/t/start-sequence-way-too-long-and-redundant/123733) |
| Imprimiendo PLA | **95 W** de promedio (0,025–0,028 kWh en 16 min 58 s) | resto del tiempo | Oficial | [Wiki – Power consumption](https://wiki.bambulab.com/en/general/power-consumption) |
| Imprimiendo ABS | 200 W de promedio | — | Oficial | ídem |
| Imprimiendo PC | 150 W de promedio | — | Oficial | ídem |
| Potencia máxima de la fuente | 1300 W @220 V / 350 W @110 V | — | Oficial | [bambulab.com – A1 specs](https://bambulab.com/en/a1/tech-specs) |

## Modelo de cálculo

- La duración ingresada es el total. Primero van 2 min de cama calentando a 1113,68 W, después 4 min de arranque a 120 W y el resto imprimiendo a 95 W (PLA).
- Cada tramo se multiplica por el precio del kWh de la franja UTE en la que cae.
- Ejemplo, placa de 10 h que arranca a las 23:00: 0,9856 kWh y $4,01 de energía, contra 0,95 kWh y $3,78 con 95 W planos.

## Qué tan confiables son los datos

- El test oficial de 17 min no puede incluir un calentamiento de cama de 2 min a 1100 W, porque ese calentamiento solo ya consume unos 37 Wh y el test entero consumió 25–28 Wh. Por eso el arranque se suma aparte y no se cuenta dos veces.
- Bambu no publica cuánto tarda en calentar la cama. Los 2 min son una estimación: si alguna vez lo cronometrás, corregilo en la calculadora.
- No hay datos oficiales para PETG, TPU ni nylon. Se usa el valor de PLA, que probablemente se queda corto para el PETG.
- Se descartaron dos fuentes: los artículos "wiki" de AliExpress, que no explican cómo midieron y parecen generados automáticamente, y una reseña que en realidad midió la A1 mini.
- La lectura más útil sería medir la impresora con un medidor de enchufe.
