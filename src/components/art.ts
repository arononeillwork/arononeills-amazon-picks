/**
 * Flat product drawings, one per entry slug, shown until Aron adds his own
 * photo. They're drawings of the kind of product, not of the exact model, and
 * the product page labels them "Illustration". Drawn on a 400 x 300 canvas and
 * coloured by the category's tone through the classes styled in global.css:
 *
 *   sh shadow · b body · s soft tint · a accent · ad deep accent · k ink · hl highlight
 *   ln-* the same colours as strokes · scr screen content
 *
 * A new product without a drawing falls back to its category icon.
 */
export const art: Record<string, string> = {
  "power-bank": `
    <ellipse class="sh" cx="204" cy="262" rx="88" ry="11"/>
    <rect class="s" x="146" y="44" width="124" height="214" rx="28"/>
    <rect class="b" x="134" y="38" width="124" height="214" rx="28"/>
    <rect class="k" x="160" y="48" width="16" height="6" rx="3"/>
    <rect class="k" x="182" y="48" width="16" height="6" rx="3"/>
    <rect class="k" x="204" y="48" width="26" height="6" rx="3"/>
    <rect class="k" x="160" y="78" width="72" height="44" rx="10"/>
    <rect class="a" x="170" y="94" width="42" height="12" rx="3"/>
    <rect class="a" x="216" y="97" width="4" height="6" rx="1"/>
    <path class="a" d="M204 146 L180 190 H198 L190 226 L218 178 H200 Z"/>
    <rect class="hl" x="142" y="64" width="8" height="164" rx="4"/>`,

  laptop: `
    <ellipse class="sh" cx="200" cy="244" rx="162" ry="10"/>
    <rect class="b" x="84" y="50" width="232" height="162" rx="14"/>
    <rect class="k" x="95" y="61" width="210" height="140" rx="5"/>
    <rect class="a" x="111" y="77" width="70" height="10" rx="3"/>
    <rect class="scr" x="111" y="99" width="178" height="8" rx="2"/>
    <rect class="scr" x="111" y="115" width="178" height="8" rx="2"/>
    <rect class="scr" x="111" y="131" width="178" height="8" rx="2"/>
    <rect class="scr" x="111" y="147" width="178" height="8" rx="2"/>
    <rect class="scr" x="111" y="163" width="178" height="8" rx="2"/>
    <rect class="a" x="229" y="163" width="60" height="8" rx="2"/>
    <rect class="k" x="170" y="95" width="3" height="80"/>
    <rect class="b" x="54" y="208" width="292" height="18" rx="9"/>
    <rect class="s" x="54" y="218" width="292" height="8" rx="4"/>
    <rect class="s" x="174" y="208" width="52" height="6" rx="3"/>`,

  "water-bottle": `
    <ellipse class="sh" cx="200" cy="262" rx="62" ry="9"/>
    <path class="ln-k" d="M188 44 C188 16 212 16 212 44" fill="none" stroke-width="8"/>
    <rect class="k" x="170" y="36" width="60" height="36" rx="12"/>
    <rect class="b" x="178" y="70" width="44" height="24" rx="6"/>
    <path class="a" d="M160 130 C160 104 174 92 186 92 H214 C226 92 240 104 240 130 V238 C240 250 232 258 220 258 H180 C168 258 160 250 160 238 Z"/>
    <rect class="ad" x="160" y="226" width="80" height="6"/>
    <rect class="hl" x="172" y="116" width="10" height="100" rx="5"/>`,

  "work-backpack": `
    <ellipse class="sh" cx="200" cy="262" rx="104" ry="10"/>
    <path class="ln-k" d="M180 62 C180 34 220 34 220 62" fill="none" stroke-width="8"/>
    <rect class="ad" x="104" y="112" width="22" height="112" rx="11"/>
    <rect class="ad" x="274" y="112" width="22" height="112" rx="11"/>
    <path class="a" d="M118 104 C118 74 140 56 170 56 H230 C260 56 282 74 282 104 V240 C282 250 274 258 264 258 H136 C126 258 118 250 118 240 Z"/>
    <path class="ad" d="M128 100 C128 78 146 64 170 64 H230 C254 64 272 78 272 100 V122 H128 Z"/>
    <rect class="ad" x="186" y="112" width="28" height="46" rx="10"/>
    <rect class="b" x="196" y="146" width="8" height="4" rx="2"/>
    <rect class="ad" x="146" y="176" width="108" height="64" rx="18"/>
    <rect class="hl" x="130" y="132" width="8" height="98" rx="4"/>`,

  "work-shoes": `
    <ellipse class="sh" cx="206" cy="258" rx="150" ry="10"/>
    <path class="b" d="M76 224 C70 196 74 168 88 150 C96 140 110 140 120 146 C132 154 146 156 158 146 L170 132 C176 126 186 128 190 136 L214 160 C240 176 290 186 322 200 C338 207 344 216 342 224 Z"/>
    <path class="s" d="M76 224 C72 200 74 178 84 160 C96 170 110 190 116 224 Z"/>
    <path class="ln-s" d="M286 188 C300 200 318 208 338 212" fill="none" stroke-width="4"/>
    <path class="ln-k" d="M176 144 L186 134 M188 152 L198 142 M200 160 L210 150" fill="none" stroke-width="4" stroke-linecap="round"/>
    <path class="ad" d="M64 224 H344 C350 224 352 230 350 236 L346 246 C344 250 340 252 334 252 H78 C70 252 64 246 64 238 Z"/>
    <rect class="a" x="66" y="226" width="282" height="6" rx="3"/>`,

  "compression-socks": `
    <ellipse class="sh" cx="236" cy="262" rx="120" ry="9"/>
    <g transform="translate(40 -12)">
      <path class="s" d="M150 36 H226 V176 C226 188 232 196 244 198 L290 204 C316 208 332 222 330 240 C328 256 312 262 294 260 L184 254 C162 252 148 236 148 214 Z"/>
    </g>
    <path class="b" d="M150 36 H226 V176 C226 188 232 196 244 198 L290 204 C316 208 332 222 330 240 C328 256 312 262 294 260 L184 254 C162 252 148 236 148 214 Z"/>
    <rect class="a" x="150" y="36" width="76" height="24" rx="3"/>
    <path class="ln-s" d="M150 88 H226 M150 112 H226 M150 132 H226 M150 148 H226 M150 162 H226" fill="none" stroke-width="3"/>
    <path class="s" d="M148 208 C150 232 164 250 186 254 L192 228 C174 226 158 220 148 208 Z"/>
    <path class="s" d="M302 207 C320 213 332 225 330 241 C328 256 314 262 298 260 C305 244 306 222 302 207 Z"/>`,

  insoles: `
    <ellipse class="sh" cx="200" cy="266" rx="110" ry="9"/>
    <g transform="translate(100 36)">
      <path class="b" d="M50 0 C80 0 96 28 94 66 C92 96 80 116 82 148 C84 182 78 222 48 224 C20 226 10 200 12 168 C14 138 4 110 2 76 C0 34 20 0 50 0 Z"/>
      <ellipse class="s" cx="50" cy="60" rx="32" ry="36"/>
      <ellipse class="a" cx="47" cy="190" rx="24" ry="22"/>
      <path class="ln-d" d="M16 36 C28 10 72 8 86 34" fill="none" stroke-width="2"/>
    </g>
    <g transform="translate(300 36) scale(-1 1)">
      <path class="b" d="M50 0 C80 0 96 28 94 66 C92 96 80 116 82 148 C84 182 78 222 48 224 C20 226 10 200 12 168 C14 138 4 110 2 76 C0 34 20 0 50 0 Z"/>
      <ellipse class="s" cx="50" cy="60" rx="32" ry="36"/>
      <ellipse class="a" cx="47" cy="190" rx="24" ry="22"/>
      <path class="ln-d" d="M16 36 C28 10 72 8 86 34" fill="none" stroke-width="2"/>
    </g>`,

  "anti-fatigue-mat": `
    <ellipse class="sh" cx="204" cy="196" rx="166" ry="40"/>
    <path class="ad" d="M60 168 L154 206 L154 220 L60 182 Z"/>
    <path class="ad" d="M154 206 L344 146 L344 160 L154 220 Z"/>
    <path class="a" d="M60 168 L250 112 L344 146 L154 206 Z"/>
    <path class="ln-ad" fill="none" stroke-width="2" d="M78.8 175.6 L268.8 118.8 M97.6 183.2 L287.6 125.6 M116.4 190.8 L306.4 132.4 M135.2 198.4 L325.2 139.2 M83.8 161 L177.8 198.5 M107.5 154 L201.5 191 M131.3 147 L225.3 183.5 M155 140 L249 176 M178.8 133 L272.8 168.5 M202.5 126 L296.5 161 M226.3 119 L320.3 153.5"/>`,

  "massage-gun": `
    <ellipse class="sh" cx="200" cy="262" rx="118" ry="10"/>
    <rect class="ad" x="182" y="120" width="54" height="138" rx="22"/>
    <circle class="b" cx="197" cy="236" r="4"/>
    <circle class="b" cx="209" cy="236" r="4"/>
    <circle class="b" cx="221" cy="236" r="4"/>
    <rect class="b" x="104" y="66" width="200" height="76" rx="38"/>
    <circle class="s" cx="266" cy="104" r="24"/>
    <circle class="a" cx="266" cy="104" r="10"/>
    <rect class="s" x="74" y="92" width="36" height="24" rx="6"/>
    <circle class="a" cx="64" cy="104" r="30"/>
    <rect class="hl" x="124" y="76" width="120" height="8" rx="4"/>`,

  "foam-roller": `
    <ellipse class="sh" cx="204" cy="250" rx="152" ry="12"/>
    <path class="a" d="M92 120 H306 A26 62 0 0 1 306 244 H92 A26 62 0 0 1 92 120 Z"/>
    <path class="ln-ad" fill="none" stroke-width="3" d="M150 122 V242 M200 122 V242 M250 122 V242 M296 124 V240"/>
    <rect class="hl" x="112" y="134" width="196" height="10" rx="5"/>
    <ellipse class="ad" cx="92" cy="182" rx="26" ry="62"/>
    <ellipse class="s" cx="92" cy="182" rx="12" ry="30"/>`,

  "foot-massage-ball": `
    <ellipse class="sh" cx="210" cy="256" rx="150" ry="11"/>
    <rect class="b" x="150" y="84" width="170" height="56" rx="28"/>
    <ellipse class="s" cx="164" cy="112" rx="14" ry="28"/>
    <circle class="a" cx="136" cy="198" r="52"/>
    <circle class="hl" cx="118" cy="178" r="14"/>
    <circle class="ad" cx="238" cy="206" r="42"/>
    <circle class="ad" cx="302" cy="206" r="42"/>
    <rect class="ad" x="238" y="182" width="64" height="48"/>
    <circle class="hl" cx="226" cy="190" r="9"/>`,

  "tens-unit": `
    <ellipse class="sh" cx="200" cy="260" rx="150" ry="10"/>
    <path class="ln-ad" d="M184 206 C178 244 136 222 112 234 M216 206 C222 244 264 222 288 234" fill="none" stroke-width="4"/>
    <rect class="s" x="62" y="214" width="84" height="42" rx="12"/>
    <rect class="a" x="72" y="222" width="64" height="26" rx="8"/>
    <rect class="s" x="254" y="214" width="84" height="42" rx="12"/>
    <rect class="a" x="264" y="222" width="64" height="26" rx="8"/>
    <rect class="b" x="148" y="56" width="104" height="154" rx="24"/>
    <rect class="k" x="164" y="74" width="72" height="46" rx="8"/>
    <path class="ln-a" d="M172 98 h10 l6 -12 l8 24 l8 -24 l8 24 l6 -12 h10" fill="none" stroke-width="3" stroke-linejoin="round"/>
    <circle class="s" cx="200" cy="158" r="20"/>
    <circle class="a" cx="200" cy="158" r="8"/>
    <rect class="s" x="166" y="188" width="26" height="8" rx="4"/>
    <rect class="s" x="208" y="188" width="26" height="8" rx="4"/>`,

  "espresso-machine": `
    <ellipse class="sh" cx="204" cy="262" rx="132" ry="10"/>
    <path class="s" d="M232 22 H292 L284 66 H240 Z"/>
    <ellipse class="ad" cx="252" cy="50" rx="7" ry="5" transform="rotate(-20 252 50)"/>
    <ellipse class="ad" cx="266" cy="42" rx="7" ry="5" transform="rotate(25 266 42)"/>
    <ellipse class="ad" cx="274" cy="54" rx="7" ry="5" transform="rotate(-10 274 54)"/>
    <ellipse class="ad" cx="258" cy="58" rx="7" ry="5" transform="rotate(30 258 58)"/>
    <rect class="b" x="92" y="64" width="216" height="192" rx="18"/>
    <rect class="k" x="112" y="82" width="66" height="42" rx="7"/>
    <rect class="a" x="120" y="92" width="34" height="6" rx="3"/>
    <rect class="scr" x="120" y="104" width="48" height="6" rx="3"/>
    <circle class="a" cx="272" cy="103" r="14"/>
    <rect class="k" x="116" y="146" width="156" height="98" rx="12"/>
    <rect class="s" x="160" y="146" width="64" height="16" rx="4"/>
    <rect class="ad" x="166" y="162" width="52" height="14" rx="6"/>
    <rect class="ad" x="212" y="165" width="66" height="9" rx="4.5"/>
    <path class="b" d="M172 204 H210 V224 C210 232 204 236 196 236 H186 C178 236 172 232 172 224 Z"/>
    <rect class="s" x="124" y="236" width="140" height="6" rx="3"/>
    <path class="ln-k" d="M294 146 L306 212" fill="none" stroke-width="6" stroke-linecap="round"/>
    <rect class="hl" x="100" y="74" width="6" height="170" rx="3"/>`,

  "coffee-canister": `
    <ellipse class="sh" cx="200" cy="264" rx="84" ry="10"/>
    <rect class="s" x="136" y="80" width="128" height="180" rx="22"/>
    <path class="ad" d="M140 150 H260 V236 C260 250 250 256 238 256 H162 C150 256 140 250 140 236 Z"/>
    <ellipse class="a" cx="156" cy="166" rx="9" ry="6" transform="rotate(-20 156 166)"/>
    <ellipse class="a" cx="182" cy="172" rx="9" ry="6" transform="rotate(25 182 172)"/>
    <ellipse class="a" cx="210" cy="164" rx="9" ry="6" transform="rotate(-35 210 164)"/>
    <ellipse class="a" cx="238" cy="170" rx="9" ry="6" transform="rotate(15 238 170)"/>
    <ellipse class="a" cx="166" cy="190" rx="9" ry="6" transform="rotate(40 166 190)"/>
    <ellipse class="a" cx="194" cy="196" rx="9" ry="6" transform="rotate(-10 194 196)"/>
    <ellipse class="a" cx="224" cy="192" rx="9" ry="6" transform="rotate(30 224 192)"/>
    <ellipse class="a" cx="248" cy="198" rx="9" ry="6" transform="rotate(-25 248 198)"/>
    <ellipse class="a" cx="156" cy="216" rx="9" ry="6" transform="rotate(10 156 216)"/>
    <ellipse class="a" cx="184" cy="222" rx="9" ry="6" transform="rotate(-30 184 222)"/>
    <ellipse class="a" cx="214" cy="218" rx="9" ry="6" transform="rotate(20 214 218)"/>
    <ellipse class="a" cx="242" cy="224" rx="9" ry="6" transform="rotate(-15 242 224)"/>
    <ellipse class="a" cx="170" cy="240" rx="9" ry="6" transform="rotate(35 170 240)"/>
    <ellipse class="a" cx="204" cy="242" rx="9" ry="6" transform="rotate(-5 204 242)"/>
    <ellipse class="a" cx="234" cy="244" rx="9" ry="6" transform="rotate(25 234 244)"/>
    <rect class="k" x="128" y="54" width="144" height="34" rx="12"/>
    <rect class="k" x="150" y="42" width="100" height="16" rx="8"/>
    <circle class="a" cx="200" cy="50" r="5"/>
    <rect class="hl" x="148" y="98" width="8" height="140" rx="4"/>`,

  "multi-cooker": `
    <ellipse class="sh" cx="200" cy="262" rx="142" ry="10"/>
    <rect class="b" x="82" y="64" width="236" height="194" rx="22"/>
    <path class="ad" d="M82 86 C82 74 92 64 104 64 H296 C308 64 318 74 318 86 V104 H82 Z"/>
    <rect class="k" x="180" y="74" width="40" height="20" rx="4"/>
    <rect class="a" x="188" y="81" width="24" height="6" rx="3"/>
    <circle class="b" cx="126" cy="84" r="8"/>
    <circle class="b" cx="274" cy="84" r="8"/>
    <rect class="k" x="104" y="118" width="192" height="108" rx="14"/>
    <path class="ln-s" d="M160 158 c-8 -8 8 -14 0 -24 M200 154 c-8 -8 8 -14 0 -24 M240 158 c-8 -8 8 -14 0 -24" fill="none" stroke-width="4" stroke-linecap="round"/>
    <ellipse class="a" cx="156" cy="176" rx="20" ry="10"/>
    <ellipse class="a" cx="200" cy="174" rx="20" ry="11"/>
    <ellipse class="a" cx="244" cy="176" rx="20" ry="10"/>
    <rect class="ad" x="118" y="184" width="164" height="8" rx="4"/>
    <rect class="scr" x="118" y="200" width="164" height="16" rx="6"/>
    <rect class="s" x="130" y="236" width="140" height="8" rx="4"/>`,

  "usb-power-strip": `
    <ellipse class="sh" cx="200" cy="232" rx="176" ry="12"/>
    <path class="ln-k" d="M22 168 C-2 170 4 246 60 252" fill="none" stroke-width="7" stroke-linecap="round"/>
    <rect class="s" x="26" y="126" width="330" height="100" rx="22"/>
    <rect class="b" x="20" y="116" width="330" height="100" rx="22"/>
    <rect class="a" x="28" y="150" width="12" height="32" rx="5"/>
    <g class="sockets">
      <circle class="s" cx="66" cy="166" r="21"/><circle class="k" cx="58" cy="166" r="3.5"/><circle class="k" cx="74" cy="166" r="3.5"/>
      <circle class="s" cx="114" cy="166" r="21"/><circle class="k" cx="106" cy="166" r="3.5"/><circle class="k" cx="122" cy="166" r="3.5"/>
      <circle class="s" cx="162" cy="166" r="21"/><circle class="k" cx="154" cy="166" r="3.5"/><circle class="k" cx="170" cy="166" r="3.5"/>
      <circle class="s" cx="210" cy="166" r="21"/><circle class="k" cx="202" cy="166" r="3.5"/><circle class="k" cx="218" cy="166" r="3.5"/>
      <circle class="s" cx="258" cy="166" r="21"/><circle class="k" cx="250" cy="166" r="3.5"/><circle class="k" cx="266" cy="166" r="3.5"/>
    </g>
    <rect class="k" x="290" y="134" width="46" height="64" rx="10"/>
    <rect class="b" x="302" y="142" width="22" height="6" rx="3"/>
    <rect class="b" x="302" y="153" width="22" height="6" rx="3"/>
    <rect class="b" x="302" y="164" width="22" height="6" rx="3"/>
    <rect class="a" x="299" y="176" width="28" height="7" rx="1.5"/>
    <rect class="a" x="299" y="187" width="28" height="7" rx="1.5"/>`,

  sunscreen: `
    <circle class="a" cx="318" cy="72" r="22"/>
    <path class="ln-a" d="M318 34 V42 M318 102 V110 M280 72 H288 M348 72 H356 M291 45 L297 51 M339 93 L345 99 M345 45 L339 51 M297 93 L291 99" fill="none" stroke-width="4" stroke-linecap="round"/>
    <ellipse class="sh" cx="200" cy="262" rx="72" ry="9"/>
    <rect class="ad" x="164" y="220" width="72" height="38" rx="10"/>
    <path class="b" d="M150 60 H250 C256 60 260 64 260 70 L244 222 H156 L140 70 C140 64 144 60 150 60 Z"/>
    <rect class="s" x="146" y="50" width="108" height="14" rx="4"/>
    <path class="a" d="M156 108 H244 L238 184 H162 Z"/>
    <circle class="b" cx="200" cy="146" r="14"/>
    <path class="ln-b" d="M200 118 V124 M200 168 V174 M172 146 H178 M222 146 H228" fill="none" stroke-width="4" stroke-linecap="round"/>
    <rect class="hl" x="152" y="76" width="8" height="120" rx="4"/>`,

  "face-sunscreen": `
    <circle class="a" cx="318" cy="72" r="22"/>
    <path class="ln-a" d="M318 34 V42 M318 102 V110 M280 72 H288 M348 72 H356 M291 45 L297 51 M339 93 L345 99 M345 45 L339 51 M297 93 L291 99" fill="none" stroke-width="4" stroke-linecap="round"/>
    <ellipse class="sh" cx="196" cy="264" rx="60" ry="9"/>
    <rect class="ad" x="176" y="46" width="40" height="46" rx="10"/>
    <rect class="s" x="182" y="88" width="28" height="24" rx="6"/>
    <rect class="b" x="160" y="110" width="72" height="150" rx="16"/>
    <rect class="a" x="160" y="158" width="72" height="56"/>
    <circle class="b" cx="196" cy="186" r="10"/>
    <rect class="hl" x="168" y="122" width="7" height="126" rx="3.5"/>
    <path class="a" d="M292 158 C292 158 270 186 270 200 A22 22 0 0 0 314 200 C314 186 292 158 292 158 Z"/>
    <circle class="hl" cx="284" cy="200" r="5"/>`,
};
