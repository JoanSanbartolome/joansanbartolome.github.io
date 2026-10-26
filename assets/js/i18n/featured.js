/* Textos en inglés de la sección "featured" (proyecto destacado: placa STM32F746ZG). */
site.addTranslations('en', {
  'featured.tag': 'Featured project',
  'featured.title': 'STM32F746ZG Control Board: 4-Layer PCB with Controlled Impedance',
  'featured.lead':
    'Individual final project for the Printed Circuit Design course of the MSc in Electronic Systems Engineering (UPV). Starting from ST’s NUCLEO-F746ZG reference design, I redesigned the whole board in Altium Designer: schematic, component selection, stack-up, my own placement and routing, and the manufacturing package.',
  'featured.date_start': 'Feb 2026',
  'featured.date_end': 'Jun 2026',

  'featured.hl1_value': 'Grade 9.5/10',
  'featured.hl1_text': 'Final project grade for the course',
  'featured.hl2_value': '4-layer stack-up',
  'featured.hl2_text': 'Controlled impedance: CAN 120 Ω, Ethernet MDI 100 Ω and USB FS 90 Ω',
  'featured.hl3_value': '174 components',
  'featured.hl3_text': 'Manufacturing-ready package: Gerbers, BOM and Pick & Place',
  'featured.hl4_value': 'Signal integrity',
  'featured.hl4_text': 'Post-layout reflection simulation on CAN, USB and Ethernet',

  'featured.step1_title': 'Hierarchical schematic',
  'featured.step1_text':
    'STM32F746ZG (Cortex-M7, 216 MHz), 10/100 Ethernet with a LAN8742A PHY over RMII, USB 2.0 Full-Speed, 2 CAN buses, SPI NOR Flash and SWD debugging instead of the on-board ST-LINK.',
  'featured.step2_title': 'Component selection',
  'featured.step2_text':
    'Every part chosen from its datasheet: a 3.3 V CAN transceiver that avoids level shifters, an LDO with Power Good, the SST25VF040B Flash and screw terminals for the analog inputs.',
  'featured.step3_title': 'Analog front-end and ESD',
  'featured.step3_text':
    'Two 0–10 V inputs adapted to the ADC, and ESD protection on every exposed I/O, with a TVS diode next to the connector and, on general-purpose lines, a series resistor before the MCU pin.',
  'featured.step4_title': 'Stack-up and impedances',
  'featured.step4_text':
    '4 layers (1.54 mm) with a ground plane and a power plane; each pair’s geometry calculated with SIMBEOR in Altium’s Layer Stack Manager.',
  'featured.step5_title': 'Placement and routing',
  'featured.step5_text':
    'Separate functional blocks: MCU in the center, an isolated analog zone, Ethernet next to the RJ45 with no copper under its magnetics, and power in one corner.',
  'featured.step6_title': 'Signal integrity and manufacturing',
  'featured.step6_text':
    'Post-layout reflection simulation, DRC rules for Lab Circuits’ Class 6 process, and output of Gerbers, BOM, Pick & Place and a technical report in LaTeX.',

  'featured.tabs_label': 'Design views',
  'featured.tab_render': '3D render',
  'featured.tab_stackup': 'Stack-up',
  'featured.tab_adc': 'ADC front-end',
  'featured.tab_can': 'CAN & protection',
  'featured.tab_power': 'Power supply',

  'featured.render_alt':
    '3D render of the top side of the board: STM32F746ZG in the center, Ethernet block with RJ45 at the top right, two CAN modules on the right, analog terminals at the top, expansion header on the left and USB at the bottom left',
  'featured.render_caption': '3D render of the top side in Altium Designer.',
  'featured.render_text':
    'The STM32F746ZG (LQFP144) sits in the center of the board so the buses fan out evenly. Ethernet takes the top-right corner next to the RJ45, the analog stage and its terminals the top edge, the two CAN transceivers the right side, and power with the Micro-USB the bottom-left corner, away from the analog zone. The SPI Flash sits right above the MCU to keep the SPI2 bus under 15 mm.',

  'featured.stackup_alt':
    'Screenshot of Altium’s Layer Stack Manager with the 4 copper layers (Top, Int1 GND, Int2 PWR, Bottom), PP-004 and PP-006 prepregs, the 1.1 mm core, solder mask and gold finish',
  'featured.stackup_caption': '4-layer, 1.54 mm stack-up in Altium’s Layer Stack Manager.',
  'featured.stackup_text':
    'Top and Bottom carry the signals, Int1 is a solid ground plane and Int2 a split power plane (digital 3.3 V and analog 3.3 V). The thin dielectric (about 0.137 mm, two prepreg sheets) between each outer layer and its plane makes the target impedances reachable with Class 6 manufacturable traces: CAN 119.97 Ω (target 120 Ω), Ethernet MDI 99.99 Ω (100 Ω) and USB 94.91 Ω (90 Ω).',

  'featured.adc_alt':
    'Schematic of one analog channel: 22 kΩ and 10 kΩ divider, 1 kΩ and 100 nF RC filter with a 1.6 kHz cut-off, and an OPA350 op-amp as a voltage follower',
  'featured.adc_caption': 'Schematic of one ADC conditioning channel.',
  'featured.adc_text':
    'Two 0–10 V channels for industrial sensors. The 22 kΩ/10 kΩ divider brings 10 V down to 3.125 V, using 95 % of the ADC range; the RC anti-aliasing filter (1 kΩ and 100 nF) cuts off at fc ≈ 1.6 kHz, and the OPA350 voltage follower keeps the ADC sampling from loading the filter.',

  'featured.can_alt':
    'Schematic of the SN65HVD230Q transceiver with split termination made of two 60 Ω resistors and a 4.7 nF capacitor to ground, and a 0 Ω resistor on the RS pin',
  'featured.can_caption': 'CAN transceiver with split termination.',
  'featured.can_text':
    'Two CAN nodes with the SN65HVD230Q, which runs at 3.3 V without level shifters. The fixed split termination (2 × 60 Ω with 4.7 nF to ground) filters common-mode noise, and the RS pin goes to ground through 0 Ω: it can be swapped for 10–100 kΩ to limit the slew rate if EMC testing requires it. ESD protection with a PESD2CANFD24V next to the connector; on the other I/O, USBLC6-4SC6 (USB and Ethernet) and ESDA6V1BC6 (expansion), the latter followed by 100 Ω series resistors.',

  'featured.power_alt':
    'Schematic of the power input: LD39050PU33R LDO regulator from 5 V to 3.3 V with 1 µF and 100 nF capacitors at input and output, and an indicator LED',
  'featured.power_caption': '3.3 V LDO regulator powered from USB.',
  'featured.power_text':
    'The board is powered at 5 V through the Micro-USB, with a 0.5 A resettable fuse and a Schottky diode against reverse current. An LD39050 3.3 V, 500 mA LDO with a Power Good output supplies the system; each of the MCU’s 12 VDD pins has its own 100 nF capacitor right next to it, and a BLM18PG121SN1D ferrite bead isolates VDDA/VREF+ from digital noise.',

  'featured.stack_label': 'Tech stack:',
  'featured.repo': 'View repository on GitHub',
  'featured.new_tab': '(opens in a new tab)',
});
