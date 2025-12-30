import{_ as kt}from"./PaymentMethodSelector-DGmnaSg8.js";import{p as Ye,f as Ze,r as b,x as G,e as et,I as Te,c as r,o as n,a as e,b as te,A as H,k as B,af as ze,M as Be,w as Ue,h,d as j,v as ae,t as l,l as C,g as lt,J as Le,T as Ge,F as de,y as ye,Y as $t,j as _e,K as Se,i as It}from"#entry";import{u as it}from"./usePacientes-DxI2ZoZB.js";import{u as Ct}from"./useToast-Cq0GyJHs.js";import{r as nt}from"./XMarkIcon-DWNj0d99.js";import{r as Ft}from"./UserIcon-G1mM6o1b.js";import{r as Pt}from"./TicketIcon-DRclOuRO.js";import{r as Et}from"./CurrencyEuroIcon-ctfYYmfn.js";import{r as rt}from"./DocumentTextIcon-Dp_75vtG.js";import{_ as Dt}from"./_plugin-vue_export-helper-DlAUqK2U.js";function tt(){const U=Ye(),{userProfile:L}=Ze(),y=b([]),V=b(null),_=b(!1),N=b(null);function W(s,u,g="exento"){let S=0,F=0,R=0,q=0;u==="empresa"?(S=21,F=A(s*.21),R=15,q=A(s*.15)):g==="general"&&(S=21,F=A(s*.21));const ue=A(s+F-q);return{baseImponible:A(s),porcentajeIVA:S,importeIVA:F,porcentajeIRPF:R,importeIRPF:q,total:ue}}function A(s){return Math.round(s*100)/100}function J(s){if(!s)return!1;const u=s.toUpperCase().replace(/[^A-Z0-9]/g,"");if(u.length!==9)return!1;if(/^[0-9]{8}[A-Z]$/.test(u)){const R="TRWAGMYFPDXBNJZSQVHLCKE",q=parseInt(u.substring(0,8)),ue=R[q%23];return u[8]===ue}if(/^[XYZ][0-9]{7}[A-Z]$/.test(u)){let R=u.substring(1,8);u[0]==="X"?R="0"+R:u[0]==="Y"?R="1"+R:u[0]==="Z"&&(R="2"+R);const q="TRWAGMYFPDXBNJZSQVHLCKE",ue=parseInt(R),se=q[ue%23];return u[8]===se}return!!/^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[A-J0-9]$/.test(u)}function K(s){return s?s.toUpperCase().replace(/[^A-Z0-9]/g,""):""}async function Y(){const s=L.value?.terapeuta_id||L.value?.id;if(!s)return"exento";try{const{data:u,error:g}=await U.from("terapeutas").select("datos_fiscales").eq("id",s).single();return g||!u?"exento":u.datos_fiscales?.regimen_iva||"exento"}catch{return"exento"}}async function ve(s){const u=L.value?.terapeuta_id||L.value?.id;if(!u)return{success:!1,error:"No se encontró el terapeuta"};_.value=!0,N.value=null;try{if(s.tipoCliente==="empresa"&&s.receptorNif&&!J(s.receptorNif))return{success:!1,error:"El NIF/CIF no es válido"};const g=await Y(),{data:S,error:F}=await U.rpc("fn_crear_factura",{p_terapeuta_id:u,p_paciente_id:s.pacienteId||null,p_tipo_cliente:s.tipoCliente,p_receptor_nombre:s.receptorNombre,p_receptor_nif:s.receptorNif?K(s.receptorNif):null,p_receptor_direccion:s.receptorDireccion||null,p_concepto:s.concepto,p_base_imponible:s.baseImponible,p_aplicar_iva:s.tipoCliente==="empresa"||g==="general",p_aplicar_irpf:s.tipoCliente==="empresa",p_lineas_detalle:s.lineasDetalle||[],p_bono_id:s.bonoId||null,p_pago_id:s.pagoId||null});if(F)throw new Error(F.message);const{data:R,error:q}=await U.from("facturas").select("*").eq("id",S).single();if(q)throw new Error(q.message);return{success:!0,data:R}}catch(g){return N.value=g.message,console.error("[useFacturas] Error creando factura:",g),{success:!1,error:g.message}}finally{_.value=!1}}async function re(s={}){const u=L.value?.terapeuta_id||L.value?.id;if(!u)return{success:!1,error:"No se encontró el terapeuta"};_.value=!0,N.value=null;try{let g=U.from("facturas").select(`
          *,
          paciente:pacientes(id, nombre_completo, email)
        `).eq("terapeuta_id",u).order("fecha_emision",{ascending:!1});s.fechaDesde&&(g=g.gte("fecha_emision",s.fechaDesde)),s.fechaHasta&&(g=g.lte("fecha_emision",s.fechaHasta)),s.pacienteId&&(g=g.eq("paciente_id",s.pacienteId)),s.estado&&(g=g.eq("estado",s.estado)),s.busqueda&&(g=g.or(`numero_factura.ilike.%${s.busqueda}%,receptor_nombre.ilike.%${s.busqueda}%,concepto.ilike.%${s.busqueda}%`));const{data:S,error:F}=await g;if(F)throw new Error(F.message);return y.value=S||[],{success:!0,data:y.value,total:y.value.length}}catch(g){return N.value=g.message,console.error("[useFacturas] Error obteniendo facturas:",g),{success:!1,error:g.message}}finally{_.value=!1}}async function ce(s){_.value=!0,N.value=null;try{const{data:u,error:g}=await U.from("facturas").select(`
          *,
          paciente:pacientes(id, nombre_completo, email, telefono)
        `).eq("id",s).single();if(g)throw new Error(g.message);return V.value=u,{success:!0,data:V.value}}catch(u){return N.value=u.message,console.error("[useFacturas] Error obteniendo factura:",u),{success:!1,error:u.message}}finally{_.value=!1}}async function fe(s,u){if(!u||u.trim().length<3)return{success:!1,error:"Debe indicar un motivo de anulación"};_.value=!0,N.value=null;try{const{data:g,error:S}=await U.rpc("fn_anular_factura",{p_factura_id:s,p_motivo:u.trim()});if(S)throw new Error(S.message);if(!g)return{success:!1,error:"No se pudo anular la factura. Puede que ya esté anulada."};const F=y.value.findIndex(R=>R.id===s);return F!==-1&&(y.value[F].estado="anulada",y.value[F].motivo_anulacion=u),{success:!0}}catch(g){return N.value=g.message,console.error("[useFacturas] Error anulando factura:",g),{success:!1,error:g.message}}finally{_.value=!1}}async function p(){const s=L.value?.terapeuta_id||L.value?.id;if(!s)return null;try{const{data:u,error:g}=await U.from("terapeutas").select("numeracion_facturas").eq("id",s).single();if(g||!u)return null;const S=u.numeracion_facturas;if(!S)return null;const F=new Date().getFullYear(),q=(F>S.anio_actual?1:S.ultimo_numero+1).toString().padStart(4,"0");return`${S.prefijo}-${F}-${q}`}catch{return null}}async function P(){const s=L.value?.terapeuta_id||L.value?.id;if(!s)return null;try{const{data:u,error:g}=await U.from("terapeutas").select("datos_fiscales").eq("id",s).single();return g||!u?null:u.datos_fiscales}catch{return null}}async function T(s){const u=L.value?.terapeuta_id||L.value?.id;if(!u)return{success:!1,error:"No se encontró el terapeuta"};if(s.nif&&!J(s.nif))return{success:!1,error:"El NIF no es válido"};_.value=!0;try{const{error:g}=await U.from("terapeutas").update({datos_fiscales:{...s,nif:s.nif?K(s.nif):""},updated_at:new Date().toISOString()}).eq("id",u);if(g)throw new Error(g.message);return{success:!0}}catch(g){return console.error("[useFacturas] Error guardando datos fiscales:",g),{success:!1,error:g.message}}finally{_.value=!1}}function E(s){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(s)}function X(s){return new Date(s).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})}function w(s){return{borrador:"bg-gray-100 text-gray-700",emitida:"bg-green-100 text-green-700",anulada:"bg-red-100 text-red-700"}[s]||"bg-gray-100 text-gray-600"}function Q(s){return{borrador:"Borrador",emitida:"Emitida",anulada:"Anulada"}[s]||s}const v=G(()=>y.value.filter(s=>s.estado==="emitida").reduce((s,u)=>s+u.total,0)),f=G(()=>y.value.filter(s=>s.estado==="emitida")),c=G(()=>y.value.filter(s=>s.estado==="anulada"));return{facturas:y,facturaActual:V,loading:_,error:N,totalFacturado:v,facturasEmitidas:f,facturasAnuladas:c,calcularImpuestos:W,redondear:A,validarNIF:J,formatearNIF:K,crearFactura:ve,getFacturas:re,getFactura:ce,anularFactura:fe,getProximoNumero:p,getDatosFiscales:P,guardarDatosFiscales:T,obtenerRegimenIVA:Y,formatearImporte:E,formatearFecha:X,getEstadoColor:w,getEstadoTexto:Q}}const St={class:"space-y-5"},Mt={class:"grid grid-cols-2 gap-3"},At={key:0,class:"space-y-4 overflow-hidden"},Vt={class:"grid grid-cols-1 md:grid-cols-2 gap-4"},jt={key:0,class:"mt-1 text-xs text-red-600"},Rt={class:"bg-gray-50 rounded-lg p-4 border border-gray-200"},Nt={class:"space-y-2 text-sm"},Tt={class:"flex justify-between"},zt={class:"font-medium text-gray-900"},Bt={class:"flex justify-between"},Ut={class:"text-gray-600"},Lt={key:0,class:"flex justify-between"},Ot={class:"text-gray-600"},Ht={class:"font-medium text-red-600"},qt={class:"flex justify-between text-base"},Gt={class:"font-bold text-purple-600"},Yt={class:"mt-3 text-xs text-gray-500 flex items-center gap-1"},Zt=et({__name:"FacturaForm",props:{baseImponible:{},regimenIVA:{default:"exento"},initialTipoCliente:{default:"particular"},initialDatosEmpresa:{default:()=>({nombre:"",nif:"",direccion:""})}},emits:["update"],setup(U,{emit:L}){const y=U,V=L,_=b(y.initialTipoCliente),N=b({nombre:y.initialDatosEmpresa.nombre,nif:y.initialDatosEmpresa.nif,direccion:y.initialDatosEmpresa.direccion}),W=b(null),{calcularImpuestos:A,validarNIF:J,formatearImporte:K}=tt(),Y=G(()=>A(y.baseImponible,_.value,y.regimenIVA));function ve(){_.value==="empresa"&&N.value.nif?J(N.value.nif)?W.value=null:W.value="NIF/CIF no válido":W.value=null}function re(){V("update",{tipoCliente:_.value,datosEmpresa:_.value==="empresa"?N.value:null,calculo:Y.value})}Te([_,N,()=>y.baseImponible],()=>{re()},{deep:!0,immediate:!0});const ce=G(()=>_.value==="empresa"?"IVA 21% + Retención IRPF 15%":y.regimenIVA==="exento"?"Exento de IVA (Art. 20.1.3º LIVA - Servicios sanitarios)":"IVA 21%");return(fe,p)=>(n(),r("div",St,[e("div",null,[p[7]||(p[7]=e("label",{class:"block text-sm font-medium text-gray-700 mb-3"}," Tipo de cliente ",-1)),e("div",Mt,[e("label",{class:H(["flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",_.value==="particular"?"border-purple-500 bg-purple-50":"border-gray-200 hover:border-gray-300"])},[B(e("input",{type:"radio","onUpdate:modelValue":p[0]||(p[0]=P=>_.value=P),value:"particular",class:"w-4 h-4 text-purple-600 focus:ring-purple-500"},null,512),[[ze,_.value]]),p[5]||(p[5]=e("div",null,[e("span",{class:"text-sm font-medium text-gray-900"},"Particular"),e("p",{class:"text-xs text-gray-500"},"Persona física")],-1))],2),e("label",{class:H(["flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",_.value==="empresa"?"border-purple-500 bg-purple-50":"border-gray-200 hover:border-gray-300"])},[B(e("input",{type:"radio","onUpdate:modelValue":p[1]||(p[1]=P=>_.value=P),value:"empresa",class:"w-4 h-4 text-purple-600 focus:ring-purple-500"},null,512),[[ze,_.value]]),p[6]||(p[6]=e("div",null,[e("span",{class:"text-sm font-medium text-gray-900"},"Empresa"),e("p",{class:"text-xs text-gray-500"},"Persona jurídica")],-1))],2)])]),te(Be,{"enter-active-class":"transition-all duration-200","enter-from-class":"opacity-0 max-h-0","enter-to-class":"opacity-100 max-h-96","leave-active-class":"transition-all duration-150","leave-from-class":"opacity-100 max-h-96","leave-to-class":"opacity-0 max-h-0"},{default:Ue(()=>[_.value==="empresa"?(n(),r("div",At,[e("div",Vt,[e("div",null,[p[8]||(p[8]=e("label",{class:"block text-sm font-medium text-gray-700 mb-1"},[j(" Razón social "),e("span",{class:"text-red-500"},"*")],-1)),B(e("input",{"onUpdate:modelValue":p[2]||(p[2]=P=>N.value.nombre=P),type:"text",placeholder:"Nombre de la empresa",class:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500",required:""},null,512),[[ae,N.value.nombre]])]),e("div",null,[p[9]||(p[9]=e("label",{class:"block text-sm font-medium text-gray-700 mb-1"},[j(" CIF "),e("span",{class:"text-red-500"},"*")],-1)),B(e("input",{"onUpdate:modelValue":p[3]||(p[3]=P=>N.value.nif=P),type:"text",placeholder:"B12345678",class:H(["w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase",W.value?"border-red-300 bg-red-50":"border-gray-300"]),onBlur:ve,required:""},null,34),[[ae,N.value.nif]]),W.value?(n(),r("p",jt,l(W.value),1)):h("",!0)])]),e("div",null,[p[10]||(p[10]=e("label",{class:"block text-sm font-medium text-gray-700 mb-1"},[j(" Dirección fiscal "),e("span",{class:"text-red-500"},"*")],-1)),B(e("input",{"onUpdate:modelValue":p[4]||(p[4]=P=>N.value.direccion=P),type:"text",placeholder:"Calle, número, CP, Ciudad",class:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500",required:""},null,512),[[ae,N.value.direccion]])])])):h("",!0)]),_:1}),e("div",Rt,[p[15]||(p[15]=e("h4",{class:"text-sm font-medium text-gray-700 mb-3"},"Desglose de factura",-1)),e("div",Nt,[e("div",Tt,[p[11]||(p[11]=e("span",{class:"text-gray-600"},"Base imponible:",-1)),e("span",zt,l(C(K)(Y.value.baseImponible)),1)]),e("div",Bt,[e("span",Ut," IVA ("+l(Y.value.porcentajeIVA)+"%): ",1),e("span",{class:H(["font-medium",Y.value.importeIVA>0?"text-gray-900":"text-gray-400"])},l(Y.value.importeIVA>0?"+":"")+l(C(K)(Y.value.importeIVA)),3)]),_.value==="empresa"?(n(),r("div",Lt,[e("span",Ot," Retención IRPF ("+l(Y.value.porcentajeIRPF)+"%): ",1),e("span",Ht," -"+l(C(K)(Y.value.importeIRPF)),1)])):h("",!0),p[13]||(p[13]=e("div",{class:"border-t border-gray-300 my-2"},null,-1)),e("div",qt,[p[12]||(p[12]=e("span",{class:"font-semibold text-gray-900"},"TOTAL:",-1)),e("span",Gt,l(C(K)(Y.value.total)),1)])]),e("p",Yt,[p[14]||(p[14]=e("svg",{class:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})],-1)),j(" "+l(ce.value),1)])])]))}}),Jt=Object.assign(Zt,{__name:"FacturaForm"});function dt(){const U=Ye(),{userProfile:L}=Ze(),y=b([]),V=b(!1),_=b(null);async function N(v){const f=L.value?.terapeuta_id||L.value?.id;if(!f)return{success:!1,error:"No se encontró el terapeuta"};if(!v.pacienteId)return{success:!1,error:"Debe seleccionar un paciente"};if(!v.monto||v.monto<=0)return{success:!1,error:"El monto debe ser mayor a 0"};V.value=!0,_.value=null;try{const{data:c,error:s}=await U.from("pagos_registros").insert({terapeuta_id:f,paciente_id:v.pacienteId,fecha_pago:v.fechaPago||new Date().toISOString().split("T")[0],monto:v.monto,metodo_pago:v.metodoPago,concepto:v.concepto||null,bono_id:v.bonoId||null,factura_id:v.facturaId||null,cita_id:v.citaId||null}).select(`
          *,
          paciente:pacientes(id, nombre_completo, email)
        `).single();if(s)throw new Error(s.message);return v.bonoId&&await W(v.bonoId,v.metodoPago),y.value.unshift(c),{success:!0,data:c}}catch(c){return _.value=c.message,console.error("[usePagosRegistros] Error creando pago:",c),{success:!1,error:c.message}}finally{V.value=!1}}async function W(v,f){try{await U.from("bonos").update({estado_pago:"pagado",metodo_pago:f,fecha_pago:new Date().toISOString(),pagado:!0,updated_at:new Date().toISOString()}).eq("id",v)}catch(c){console.error("[usePagosRegistros] Error actualizando bono:",c)}}async function A(v={}){const f=L.value?.terapeuta_id||L.value?.id;if(!f)return{success:!1,error:"No se encontró el terapeuta"};V.value=!0,_.value=null;try{let c=U.from("pagos_registros").select(`
          *,
          paciente:pacientes(id, nombre_completo, email),
          bono:bonos(id, tipo, sesiones_totales, monto_total),
          factura:facturas(id, numero_factura)
        `).eq("terapeuta_id",f).order("fecha_pago",{ascending:!1}).order("created_at",{ascending:!1});v.fechaDesde&&(c=c.gte("fecha_pago",v.fechaDesde)),v.fechaHasta&&(c=c.lte("fecha_pago",v.fechaHasta)),v.pacienteId&&(c=c.eq("paciente_id",v.pacienteId)),v.metodoPago&&(c=c.eq("metodo_pago",v.metodoPago)),v.conFactura!==void 0&&(v.conFactura?c=c.not("factura_id","is",null):c=c.is("factura_id",null)),v.busqueda&&(c=c.or(`concepto.ilike.%${v.busqueda}%`));const{data:s,error:u}=await c;if(u)throw new Error(u.message);return y.value=s||[],{success:!0,data:y.value,total:y.value.length}}catch(c){return _.value=c.message,console.error("[usePagosRegistros] Error obteniendo pagos:",c),{success:!1,error:c.message}}finally{V.value=!1}}async function J(v){V.value=!0,_.value=null;try{const{data:f,error:c}=await U.from("pagos_registros").select(`
          *,
          paciente:pacientes(id, nombre_completo, email, telefono),
          bono:bonos(id, tipo, sesiones_totales, sesiones_restantes, monto_total, estado),
          factura:facturas(id, numero_factura, total, estado)
        `).eq("id",v).single();if(c)throw new Error(c.message);return{success:!0,data:f}}catch(f){return _.value=f.message,console.error("[usePagosRegistros] Error obteniendo pago:",f),{success:!1,error:f.message}}finally{V.value=!1}}async function K(v,f){V.value=!0,_.value=null;try{const c={updated_at:new Date().toISOString()};f.fechaPago&&(c.fecha_pago=f.fechaPago),f.monto&&(c.monto=f.monto),f.metodoPago&&(c.metodo_pago=f.metodoPago),f.concepto!==void 0&&(c.concepto=f.concepto),f.facturaId!==void 0&&(c.factura_id=f.facturaId);const{data:s,error:u}=await U.from("pagos_registros").update(c).eq("id",v).select(`
          *,
          paciente:pacientes(id, nombre_completo, email)
        `).single();if(u)throw new Error(u.message);const g=y.value.findIndex(S=>S.id===v);return g!==-1&&(y.value[g]=s),{success:!0,data:s}}catch(c){return _.value=c.message,console.error("[usePagosRegistros] Error actualizando pago:",c),{success:!1,error:c.message}}finally{V.value=!1}}async function Y(v){V.value=!0,_.value=null;try{const{error:f}=await U.from("pagos_registros").delete().eq("id",v);if(f)throw new Error(f.message);return y.value=y.value.filter(c=>c.id!==v),{success:!0}}catch(f){return _.value=f.message,console.error("[usePagosRegistros] Error eliminando pago:",f),{success:!1,error:f.message}}finally{V.value=!1}}async function ve(v,f){return K(v,{facturaId:f})}async function re(v){try{const{data:f,error:c}=await U.from("bonos").select("id, tipo, monto_total, sesiones_totales, sesiones_restantes, fecha_inicio, fecha_fin, estado").eq("paciente_id",v).in("estado_pago",["pendiente",null]).in("estado",["activo","pendiente"]).order("created_at",{ascending:!1});return c?(console.error("[usePagosRegistros] Error obteniendo bonos:",c),[]):f||[]}catch(f){return console.error("[usePagosRegistros] Error obteniendo bonos:",f),[]}}function ce(v){const f=v||y.value,c={efectivo:{total:0,cantidad:0},transferencia:{total:0,cantidad:0},bizum:{total:0,cantidad:0},tarjeta:{total:0,cantidad:0},stripe:{total:0,cantidad:0}};return f.forEach(s=>{s.metodo_pago&&c[s.metodo_pago]&&(c[s.metodo_pago].total+=s.monto,c[s.metodo_pago].cantidad+=1)}),{total:f.reduce((s,u)=>s+u.monto,0),cantidad:f.length,porMetodo:c}}async function fe(v,f){const c=new Date(v,f-1,1).toISOString().split("T")[0],s=new Date(v,f,0).toISOString().split("T")[0];return A({fechaDesde:c,fechaHasta:s})}function p(v){return{efectivo:"Efectivo",transferencia:"Transferencia",bizum:"Bizum",tarjeta:"Tarjeta",stripe:"Stripe"}[v]||v}function P(v){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(v)}function T(v){return new Date(v).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})}const E=G(()=>y.value.reduce((v,f)=>v+f.monto,0)),X=G(()=>ce()),w=G(()=>y.value.filter(v=>v.factura_id)),Q=G(()=>y.value.filter(v=>!v.factura_id));return{pagos:y,loading:V,error:_,totalPagos:E,resumenActual:X,pagosConFactura:w,pagosSinFactura:Q,crearPago:N,getPagos:A,getPago:J,actualizarPago:K,eliminarPago:Y,vincularConFactura:ve,getBonosPendientesPago:re,calcularResumen:ce,getPagosMes:fe,formatearMetodoPago:p,formatearImporte:P,formatearFecha:T}}const Kt={class:"px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between"},Xt={class:"text-lg font-semibold text-gray-900"},Qt={class:"text-sm text-gray-500"},Wt={class:"flex-1 overflow-y-auto p-5"},eo={key:0,class:"space-y-5"},to={class:"block text-sm font-medium text-gray-700 mb-2"},oo={class:"relative"},ao={key:1,class:"absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"},so={key:0,class:"p-3 text-center text-gray-500 text-sm"},no={key:1,class:"p-3 text-center text-gray-500 text-sm"},ro=["onClick"],lo={class:"w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium"},io={class:"text-sm font-medium text-gray-900"},co={class:"text-xs text-gray-500"},uo={key:0},po={class:"block text-sm font-medium text-gray-700 mb-2"},mo={class:"grid gap-2"},vo=["onClick"],fo={class:"flex items-center justify-between"},go={class:"font-medium text-gray-900"},bo={class:"text-purple-600 font-semibold"},xo={class:"text-xs text-gray-500 mt-1"},ho={class:"grid grid-cols-2 gap-4"},wo={class:"block text-sm font-medium text-gray-700 mb-2"},yo={class:"relative"},_o={key:1,class:"space-y-5"},ko={class:"flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer"},$o={class:"flex items-center gap-3"},Io={key:0,class:"text-sm text-gray-600 bg-purple-50 p-3 rounded-lg"},Co={class:"text-purple-700"},Fo={key:2,class:"text-center py-8 text-gray-500"},Po={key:2,class:"space-y-4"},Eo={class:"text-center pb-4 border-b border-gray-100"},Do={class:"text-3xl font-bold text-gray-900"},So={class:"text-gray-600 mt-1"},Mo={class:"bg-gray-50 rounded-lg p-4 space-y-3 text-sm"},Ao={class:"flex justify-between"},Vo={class:"font-medium"},jo={class:"flex justify-between"},Ro={class:"font-medium capitalize"},No={key:0,class:"flex justify-between"},To={class:"font-medium truncate ml-4"},zo={key:1,class:"flex justify-between"},Bo={class:"flex justify-between pt-2 border-t border-gray-200"},Uo={key:2,class:"pt-2 border-t border-gray-200"},Lo={class:"flex justify-between text-gray-600"},Oo={class:"font-bold text-purple-600"},Ho={class:"px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3"},qo=["disabled"],Go=["disabled"],Yo=["disabled"],Zo={key:0,class:"w-4 h-4 animate-spin",fill:"none",viewBox:"0 0 24 24"},Jo=et({__name:"PagoUnificadoModal",props:{visible:{type:Boolean},pacienteIdPreseleccionado:{default:void 0},bonoIdPreseleccionado:{default:void 0},montoInicial:{default:void 0}},emits:["close","saved"],setup(U,{emit:L}){const y=U,V=L,{searchPacientes:_,pacientes:N,loading:W}=it(),{crearPago:A,getBonosPendientesPago:J}=dt(),{crearFactura:K,obtenerRegimenIVA:Y,getProximoNumero:ve}=tt(),{success:re,error:ce}=Ct(),{waitForUser:fe}=Ze(),p=b("datos"),P=b(!1),T=b(!1),E=b(y.pacienteIdPreseleccionado||null),X=b(""),w=b(""),Q=b(!1),v=b(new Date().toISOString().split("T")[0]),f=b(y.montoInicial||0),c=b(null),s=b(""),u=b(y.bonoIdPreseleccionado||null),g=b([]),S=b(!1),F=b("particular"),R=b({nombre:"",nif:"",direccion:""}),q=b(null),ue=b("exento"),se=b(null);lt(async()=>{await fe(),T.value=!0,ue.value=await Y(),se.value=await ve(),y.pacienteIdPreseleccionado&&await ne(y.pacienteIdPreseleccionado)}),Te(w,async D=>{T.value||(await fe(),T.value=!0),D.length>=2?(_(D),Q.value=!0):D.length===0&&!E.value&&(_(""),Q.value=!0)});async function ne(D){if(g.value=await J(D),y.bonoIdPreseleccionado){const m=g.value.find(le=>le.id===y.bonoIdPreseleccionado);m&&(u.value=m.id,f.value=m.monto_total,s.value=`Pago de bono ${m.tipo} (${m.sesiones_totales} sesiones)`)}}function ge(D){E.value=D.id,X.value=D.nombre_completo,w.value=D.nombre_completo,Q.value=!1,ne(D.id)}function Ce(){E.value=null,X.value="",w.value="",g.value=[],u.value=null}function Je(D){u.value===D.id?u.value=null:(u.value=D.id,f.value=D.monto_total,s.value=`Pago de bono ${D.tipo} (${D.sesiones_totales} sesiones)`)}function Ke(D){F.value=D.tipoCliente,R.value=D.datosEmpresa||{nombre:"",nif:"",direccion:""},q.value=D.calculo}const Fe=G(()=>p.value==="datos"?E.value&&f.value>0&&c.value:p.value==="factura"&&S.value&&F.value==="empresa"?R.value.nombre&&R.value.nif&&R.value.direccion:!0);function be(){p.value==="datos"?p.value="factura":p.value==="factura"&&(p.value="confirmacion")}function he(){p.value==="confirmacion"?p.value="factura":p.value==="factura"&&(p.value="datos")}async function Me(){if(!(!E.value||!c.value)){P.value=!0;try{const D=await A({pacienteId:E.value,fechaPago:v.value,monto:f.value,metodoPago:c.value,concepto:s.value||void 0,bonoId:u.value||void 0});if(!D.success)throw new Error(D.error||"Error al crear el pago");let m;if(S.value&&D.data){const le=await K({pacienteId:E.value,tipoCliente:F.value,receptorNombre:F.value==="empresa"?R.value.nombre:X.value,receptorNif:F.value==="empresa"?R.value.nif:void 0,receptorDireccion:F.value==="empresa"?R.value.direccion:void 0,concepto:s.value||"Sesión de psicoterapia",baseImponible:f.value,bonoId:u.value||void 0,pagoId:D.data.id});le.success&&le.data&&(m=le.data.id)}re(S.value?"Pago y factura registrados":"Pago registrado"),V("saved",{pagoId:D.data.id,facturaId:m}),Pe()}catch(D){console.error("[PagoUnificadoModal] Error:",D),ce(D.message||"Error al guardar el pago")}finally{P.value=!1}}}function Pe(){p.value="datos",E.value=null,X.value="",w.value="",g.value=[],u.value=null,f.value=0,c.value=null,s.value="",S.value=!1,V("close")}function Ae(D){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(D)}return(D,m)=>{const le=kt,Ve=Jt;return n(),Le(Ge,{to:"body"},[te(Be,{"enter-active-class":"transition-opacity duration-200","enter-from-class":"opacity-0","enter-to-class":"opacity-100","leave-active-class":"transition-opacity duration-150","leave-from-class":"opacity-100","leave-to-class":"opacity-0"},{default:Ue(()=>[U.visible?(n(),r("div",{key:0,class:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50",onClick:_e(Pe,["self"])},[e("div",{class:"w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]",onClick:m[7]||(m[7]=_e(()=>{},["stop"]))},[e("div",Kt,[e("div",null,[e("h2",Xt,l(p.value==="datos"?"Nuevo Pago":p.value==="factura"?"Facturación":"Confirmar"),1),e("p",Qt," Paso "+l(p.value==="datos"?"1":p.value==="factura"?"2":"3")+" de 3 ",1)]),e("button",{onClick:Pe,class:"p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"},[te(C(nt),{class:"w-5 h-5"})])]),e("div",Wt,[p.value==="datos"?(n(),r("div",eo,[e("div",null,[e("label",to,[te(C(Ft),{class:"w-4 h-4 inline mr-1"}),m[8]||(m[8]=j(" Paciente ",-1)),m[9]||(m[9]=e("span",{class:"text-red-500"},"*",-1))]),e("div",oo,[B(e("input",{"onUpdate:modelValue":m[0]||(m[0]=M=>w.value=M),type:"text",placeholder:"Buscar paciente...",class:"w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500",onFocus:m[1]||(m[1]=M=>Q.value=!0)},null,544),[[ae,w.value]]),E.value?(n(),r("button",{key:0,onClick:Ce,class:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"},[te(C(nt),{class:"w-4 h-4"})])):h("",!0),Q.value&&!E.value?(n(),r("div",ao,[C(W)?(n(),r("div",so," Buscando... ")):C(N).length===0?(n(),r("div",no," No se encontraron pacientes ")):h("",!0),(n(!0),r(de,null,ye(C(N),M=>(n(),r("button",{key:M.id,class:"w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3",onClick:Xe=>ge(M)},[e("div",lo,l(M.nombre_completo.charAt(0)),1),e("div",null,[e("p",io,l(M.nombre_completo),1),e("p",co,l(M.email),1)])],8,ro))),128))])):h("",!0)])]),g.value.length>0?(n(),r("div",uo,[e("label",po,[te(C(Pt),{class:"w-4 h-4 inline mr-1"}),m[10]||(m[10]=j(" Bonos pendientes de pago ",-1))]),e("div",mo,[(n(!0),r(de,null,ye(g.value,M=>(n(),r("button",{key:M.id,class:H(["w-full p-3 border rounded-lg text-left transition-all",u.value===M.id?"border-purple-500 bg-purple-50":"border-gray-200 hover:border-gray-300"]),onClick:Xe=>Je(M)},[e("div",fo,[e("span",go,l(M.tipo),1),e("span",bo,l(Ae(M.monto_total)),1)]),e("p",xo,l(M.sesiones_totales)+" sesiones ",1)],10,vo))),128))])])):h("",!0),e("div",ho,[e("div",null,[m[11]||(m[11]=e("label",{class:"block text-sm font-medium text-gray-700 mb-2"}," Fecha ",-1)),B(e("input",{"onUpdate:modelValue":m[2]||(m[2]=M=>v.value=M),type:"date",class:"w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"},null,512),[[ae,v.value]])]),e("div",null,[e("label",wo,[te(C(Et),{class:"w-4 h-4 inline mr-1"}),m[12]||(m[12]=j(" Monto ",-1)),m[13]||(m[13]=e("span",{class:"text-red-500"},"*",-1))]),e("div",yo,[B(e("input",{"onUpdate:modelValue":m[3]||(m[3]=M=>f.value=M),type:"number",step:"0.01",min:"0",placeholder:"0.00",class:"w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"},null,512),[[ae,f.value,void 0,{number:!0}]]),m[14]||(m[14]=e("span",{class:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"},"EUR",-1))])])]),e("div",null,[m[15]||(m[15]=e("label",{class:"block text-sm font-medium text-gray-700 mb-2"},[j(" Método de pago "),e("span",{class:"text-red-500"},"*")],-1)),te(le,{"selected-method":c.value,size:"sm",onSelect:m[4]||(m[4]=M=>c.value=M)},null,8,["selected-method"])]),e("div",null,[m[16]||(m[16]=e("label",{class:"block text-sm font-medium text-gray-700 mb-2"}," Concepto ",-1)),B(e("textarea",{"onUpdate:modelValue":m[5]||(m[5]=M=>s.value=M),rows:"2",placeholder:"Describe el pago (opcional)...",class:"w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"},null,512),[[ae,s.value]])])])):p.value==="factura"?(n(),r("div",_o,[e("label",ko,[e("div",$o,[te(C(rt),{class:"w-5 h-5 text-gray-500"}),m[17]||(m[17]=e("div",null,[e("span",{class:"font-medium text-gray-900"},"Generar factura"),e("p",{class:"text-xs text-gray-500"},"Se creará una factura asociada a este pago")],-1))]),B(e("input",{type:"checkbox","onUpdate:modelValue":m[6]||(m[6]=M=>S.value=M),class:"w-5 h-5 text-purple-600 rounded focus:ring-purple-500"},null,512),[[$t,S.value]])]),S.value&&se.value?(n(),r("div",Io,[m[18]||(m[18]=j(" Próxima factura: ",-1)),e("strong",Co,l(se.value),1)])):h("",!0),S.value?(n(),Le(Ve,{key:1,"base-imponible":f.value,"regimen-i-v-a":ue.value,onUpdate:Ke},null,8,["base-imponible","regimen-i-v-a"])):h("",!0),S.value?h("",!0):(n(),r("div",Fo,[te(C(rt),{class:"w-12 h-12 mx-auto mb-3 text-gray-300"}),m[19]||(m[19]=e("p",null,"No se generará factura para este pago",-1)),m[20]||(m[20]=e("p",{class:"text-sm"},"Puedes generar una factura más tarde desde el historial",-1))]))])):p.value==="confirmacion"?(n(),r("div",Po,[e("div",Eo,[e("p",Do,l(Ae(f.value)),1),e("p",So,l(X.value),1)]),e("div",Mo,[e("div",Ao,[m[21]||(m[21]=e("span",{class:"text-gray-600"},"Fecha:",-1)),e("span",Vo,l(new Date(v.value).toLocaleDateString("es-ES")),1)]),e("div",jo,[m[22]||(m[22]=e("span",{class:"text-gray-600"},"Método:",-1)),e("span",Ro,l(c.value),1)]),s.value?(n(),r("div",No,[m[23]||(m[23]=e("span",{class:"text-gray-600"},"Concepto:",-1)),e("span",To,l(s.value),1)])):h("",!0),u.value?(n(),r("div",zo,[...m[24]||(m[24]=[e("span",{class:"text-gray-600"},"Bono:",-1),e("span",{class:"text-purple-600 font-medium"},"Asociado",-1)])])):h("",!0),e("div",Bo,[m[25]||(m[25]=e("span",{class:"text-gray-600"},"Factura:",-1)),e("span",{class:H(["font-medium",S.value?"text-green-600":"text-gray-400"])},l(S.value?"Sí":"No"),3)]),S.value&&q.value?(n(),r("div",Uo,[e("div",Lo,[m[26]||(m[26]=e("span",null,"Total factura:",-1)),e("span",Oo,l(Ae(q.value.total)),1)])])):h("",!0)])])):h("",!0)]),e("div",Ho,[p.value!=="datos"?(n(),r("button",{key:0,onClick:he,class:"px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",disabled:P.value}," Anterior ",8,qo)):h("",!0),p.value==="datos"?(n(),r("button",{key:1,onClick:Pe,class:"px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"}," Cancelar ")):h("",!0),p.value!=="confirmacion"?(n(),r("button",{key:2,onClick:be,disabled:!Fe.value,class:"flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"}," Siguiente ",8,Go)):(n(),r("button",{key:3,onClick:Me,disabled:P.value,class:"flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"},[P.value?(n(),r("svg",Zo,[...m[27]||(m[27]=[e("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"},null,-1),e("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"},null,-1)])])):h("",!0),j(" "+l(P.value?"Guardando...":"Confirmar pago"),1)],8,Yo))])])])):h("",!0)]),_:1})])}}}),Ko=Object.assign(Jo,{__name:"PaymentPagoUnificadoModal"}),Xo={class:"pagos-page"},Qo={class:"page-header"},Wo={class:"header-content"},ea={class:"tabs"},ta={key:0,class:"tab-count"},oa={key:0,class:"tab-count"},aa={key:0,class:"alerta-huerfanos"},sa={class:"alerta-contenido"},na={class:"alerta-titulo"},ra={key:1,class:"metricas-container"},la={class:"metrica-card metrica-principal"},ia={class:"metrica-contenido"},da={class:"metrica-valor"},ca={class:"metrica-card"},ua={class:"metrica-contenido"},pa={class:"metrica-valor"},ma={class:"metrica-card"},va={class:"metrica-contenido"},fa={class:"metrica-valor"},ga={class:"metrica-card"},ba={class:"metrica-contenido"},xa={class:"metrica-valor"},ha={class:"metrica-label"},wa={key:2,class:"filtros-rapidos"},ya=["onClick"],_a={class:"filtros"},ka={class:"filtro-grupo"},$a={class:"filtro-grupo"},Ia={class:"filtro-grupo"},Ca=["value"],Fa={key:0,class:"filtro-grupo"},Pa={key:1,class:"filtro-grupo"},Ea={key:3,class:"resumen-periodo"},Da={class:"periodo-info"},Sa={class:"periodo-descripcion"},Ma={class:"periodo-total"},Aa={class:"export-dropdown-container"},Va={key:0,class:"export-dropdown-menu"},ja={class:"dropdown-section"},Ra={key:4,class:"metricas-facturas"},Na={class:"metrica-factura"},Ta={class:"metrica-factura-valor"},za={class:"metrica-factura metrica-factura-principal"},Ba={class:"metrica-factura-valor"},Ua={class:"metrica-factura"},La={class:"metrica-factura-valor"},Oa={key:0,class:"metrica-factura"},Ha={class:"metrica-factura-valor"},qa={key:1,class:"metrica-factura"},Ga={class:"metrica-factura-valor"},Ya={class:"export-dropdown-container"},Za={key:0,class:"export-dropdown-menu"},Ja={class:"dropdown-section"},Ka={key:5,class:"loading-state"},Xa={key:0,class:"data-table"},Qa={class:"fecha-cell"},Wa={class:"fecha-contextual"},es={class:"fecha-texto"},ts={key:0,class:"fecha-subtexto"},os={key:0,class:"badge-problema"},as={class:"concepto-cell"},ss={class:"concepto-wrapper"},ns=["title"],rs={key:1,class:"concepto-progreso"},ls={class:"metodo-badge"},is={class:"metodo-icon"},ds={class:"text-right monto"},cs={class:"acciones-cell"},us={class:"acciones-wrapper"},ps=["onClick"],ms={key:1,class:"menu-container"},vs=["onClick"],fs=["onClick"],gs=["onClick"],bs=["onClick"],xs={key:1,class:"empty-state"},hs={key:2,class:"paginacion"},ws=["disabled"],ys={class:"pag-info"},_s=["disabled"],ks={key:7,class:"table-container"},$s={key:0,class:"data-table"},Is={class:"numero-factura"},Cs={class:"fecha"},Fs={class:"cliente-info"},Ps={class:"cliente-nombre"},Es={key:0,class:"cliente-nif"},Ds={class:"concepto"},Ss={class:"text-right"},Ms={class:"text-right monto"},As={class:"acciones"},Vs=["onClick"],js=["onClick"],Rs={key:1,class:"empty-state"},Ns={key:2,class:"paginacion"},Ts=["disabled"],zs={class:"pag-info"},Bs=["disabled"],Us={class:"modal-asignar"},Ls={class:"modal-header"},Os={class:"modal-body"},Hs={key:0,class:"pago-info-box"},qs={class:"id-huerfano"},Gs={class:"form-group"},Ys=["value"],Zs={class:"modal-footer"},Js=["disabled"],Ks={key:0},Xs={key:1},Qs={class:"modal-factura"},Ws={class:"modal-header"},en={class:"modal-body"},tn={key:0,class:"factura-pago-info"},on={class:"factura-pago-monto"},an={class:"monto-valor"},sn={class:"factura-pago-fecha"},nn={class:"metodo-badge-small"},rn={class:"form-group"},ln={class:"tipo-cliente-selector"},dn={class:"form-group"},cn={key:1,class:"form-row"},un={class:"form-group"},pn={class:"form-group"},mn={class:"form-group"},vn={key:2,class:"factura-resumen"},fn={class:"resumen-linea"},gn={key:0,class:"resumen-linea"},bn={key:1,class:"resumen-linea"},xn={class:"text-red"},hn={class:"resumen-linea resumen-total"},wn={class:"modal-footer"},yn=["disabled"],_n={key:0},kn={key:1},$n={class:"modal-content modal-informe"},In={class:"modal-header"},Cn={class:"modal-body"},Fn={class:"informe-tipo-selector"},Pn={class:"informe-periodo-selector"},En={key:0,class:"form-group"},Dn={class:"form-group"},Sn=["value"],Mn={class:"informe-preview"},An={class:"informe-preview-content"},Vn={class:"preview-item"},jn={class:"preview-value"},Rn={class:"preview-item"},Nn={class:"preview-value"},Tn={class:"modal-footer"},qe=20,zn=et({__name:"index",setup(U){const{getPagos:L,loading:y,formatearMetodoPago:V}=dt(),{getFacturas:_,crearFactura:N,loading:W,formatearImporte:A,formatearFecha:J,getEstadoColor:K,anularFactura:Y,calcularImpuestos:ve}=tt(),{pacientes:re,loadAllPacientes:ce}=it(),{waitForUser:fe,userProfile:p}=Ze(),P=b("pagos"),T=b([]),E=b([]),X=b(!1),w=b({fechaDesde:"",fechaHasta:"",pacienteId:"",estado:"",metodoPago:""}),Q=b(null),v=[{id:"hoy",label:"Hoy"},{id:"semana",label:"Esta semana"},{id:"mes",label:"Este mes"},{id:"trimestre",label:"Trimestre"},{id:"anio",label:"Este año"}];function f(a){const t=new Date;let d="",o=t.toISOString().split("T")[0];switch(a){case"hoy":d=o;break;case"semana":const $=new Date(t);$.setDate(t.getDate()-t.getDay()+1),d=$.toISOString().split("T")[0];break;case"mes":d=new Date(t.getFullYear(),t.getMonth(),1).toISOString().split("T")[0];break;case"trimestre":const x=t.getMonth();d=new Date(t.getFullYear(),Math.floor(x/3)*3,1).toISOString().split("T")[0];break;case"anio":d=new Date(t.getFullYear(),0,1).toISOString().split("T")[0];break}w.value.fechaDesde=d,w.value.fechaHasta=o,Q.value=a,Me()}const c=b(1),s=b(1),u=b(0),g=b(0);G(()=>Math.ceil(u.value/qe)),G(()=>Math.ceil(g.value/qe));const S=G(()=>y.value||W.value),F=G(()=>{const a=T.value.reduce((x,i)=>x+i.monto,0),t=T.value.length,d={};T.value.forEach(x=>{const i=x.metodo_pago||"otro";d[i]||(d[i]={total:0,cantidad:0}),d[i].total+=x.monto,d[i].cantidad+=1});let o={nombre:"-",porcentaje:0};if(t>0){const x=Object.entries(d).sort(([,i],[,k])=>k.cantidad-i.cantidad);if(x.length>0){const[i,k]=x[0];o={nombre:V(i),porcentaje:Math.round(k.cantidad/t*100)}}}const $=t>0?a/t:0;return{totalCobrado:a,cantidadPagos:t,promedioPorPago:$,metodoMasUsado:o,porMetodo:d}}),R=G(()=>{if(!w.value.fechaDesde&&!w.value.fechaHasta)return"Todos los pagos";const a=t=>new Date(t).toLocaleDateString("es-ES",{day:"numeric",month:"short"});return w.value.fechaDesde&&w.value.fechaHasta?`${a(w.value.fechaDesde)} - ${a(w.value.fechaHasta)}`:w.value.fechaDesde?`Desde ${a(w.value.fechaDesde)}`:`Hasta ${a(w.value.fechaHasta)}`}),q=G(()=>T.value.filter(a=>a.paciente_id&&!a.paciente?.nombre_completo)),ue=G(()=>q.value.length>0),se=b(!1),ne=b(null),ge=b(""),Ce=b(!1);function Je(a){ne.value=a,ge.value="",se.value=!0}async function Ke(){if(!(!ne.value||!ge.value)){Ce.value=!0;try{const a=Ye(),{error:t}=await a.from("pagos_registros").update({paciente_id:ge.value}).eq("id",ne.value.id);if(t)throw t;await be(),se.value=!1,ne.value=null,ge.value=""}catch(a){console.error("Error asignando paciente:",a),alert("Error al asignar paciente")}finally{Ce.value=!1}}}function Fe(a){return a.paciente_id!==null&&!a.paciente?.nombre_completo}async function be(){const a=await L({fechaDesde:w.value.fechaDesde||void 0,fechaHasta:w.value.fechaHasta||void 0,pacienteId:w.value.pacienteId||void 0});a.success&&a.data?(T.value=a.data,u.value=a.total||a.data.length):(T.value=[],u.value=0)}async function he(){const a=await _({fechaDesde:w.value.fechaDesde||void 0,fechaHasta:w.value.fechaHasta||void 0,pacienteId:w.value.pacienteId||void 0,estado:w.value.estado||void 0});a.success&&a.data?(E.value=a.data,g.value=a.total||a.data.length):(E.value=[],g.value=0)}function Me(){c.value=1,s.value=1,P.value==="pagos"?be():he()}function Pe(){w.value={fechaDesde:"",fechaHasta:"",pacienteId:"",estado:"",metodoPago:""},Q.value=null,Me()}async function Ae(a){if(!confirm(`¿Estás seguro de anular la factura ${a.numero_factura}?`))return;const t=prompt("Motivo de anulación:");if(!t)return;await Y(a.id,t)&&he()}function D(a){const t=p.value?.nombre_completo||"Terapeuta",d=p.value?.nif||"",o=p.value?.direccion||"",$=p.value?.ciudad||"",x=p.value?.codigo_postal||"",i=p.value?.telefono||"",k=p.value?.email||"",$e=new Date(a.fecha_emision).toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"}),Ie=Qe=>new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(Qe),Re=`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${a.numero_factura}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #7c3aed;
        }
        .header-left h1 {
          font-size: 28px;
          color: #7c3aed;
          margin-bottom: 5px;
        }
        .header-left p {
          color: #666;
          font-size: 11px;
        }
        .header-right {
          text-align: right;
        }
        .factura-numero {
          background: #7c3aed;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .factura-fecha {
          color: #666;
          font-size: 12px;
        }
        .datos-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .datos-box {
          width: 48%;
        }
        .datos-box h3 {
          font-size: 11px;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        .datos-box p {
          margin-bottom: 3px;
          color: #444;
        }
        .datos-box .nombre {
          font-weight: 600;
          font-size: 14px;
          color: #222;
        }
        .concepto-section {
          background: #f8f5ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .concepto-section h3 {
          font-size: 11px;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
        }
        .concepto-section p {
          font-size: 14px;
          color: #333;
        }
        .importes-table {
          width: 100%;
          margin-bottom: 30px;
        }
        .importes-table th,
        .importes-table td {
          padding: 12px 15px;
          text-align: right;
        }
        .importes-table th {
          text-align: left;
          background: #f3f4f6;
          font-weight: 500;
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
        }
        .importes-table td {
          border-bottom: 1px solid #eee;
        }
        .importes-table td:first-child {
          text-align: left;
          color: #444;
        }
        .importes-table .total-row td {
          border-bottom: none;
          border-top: 2px solid #7c3aed;
          font-weight: bold;
          font-size: 16px;
          color: #7c3aed;
          padding-top: 15px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #888;
          font-size: 10px;
        }
        .estado-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          margin-top: 10px;
        }
        .estado-emitida {
          background: #d1fae5;
          color: #065f46;
        }
        .estado-anulada {
          background: #fee2e2;
          color: #991b1b;
        }
        .estado-borrador {
          background: #fef3c7;
          color: #92400e;
        }
        .regimen-note {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 11px;
          color: #92400e;
          margin-bottom: 20px;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <h1>FACTURA</h1>
          <p>Servicios de psicoterapia</p>
        </div>
        <div class="header-right">
          <div class="factura-numero">${a.numero_factura}</div>
          <div class="factura-fecha">${$e}</div>
          <span class="estado-badge estado-${a.estado}">${a.estado.toUpperCase()}</span>
        </div>
      </div>

      <div class="datos-section">
        <div class="datos-box">
          <h3>Emisor</h3>
          <p class="nombre">${t}</p>
          ${d?`<p>NIF: ${d}</p>`:""}
          ${o?`<p>${o}</p>`:""}
          ${x||$?`<p>${x} ${$}</p>`:""}
          ${i?`<p>Tel: ${i}</p>`:""}
          ${k?`<p>${k}</p>`:""}
        </div>
        <div class="datos-box">
          <h3>Receptor</h3>
          <p class="nombre">${a.receptor_nombre}</p>
          ${a.receptor_nif?`<p>NIF/CIF: ${a.receptor_nif}</p>`:""}
          ${a.receptor_direccion?`<p>${a.receptor_direccion}</p>`:""}
          <p style="margin-top: 8px; color: #888; font-size: 11px;">
            Tipo: ${a.tipo_cliente==="particular"?"Particular":"Empresa"}
          </p>
        </div>
      </div>

      <div class="concepto-section">
        <h3>Concepto</h3>
        <p>${a.concepto||"Servicios de psicoterapia"}</p>
      </div>

      ${a.porcentaje_iva===0?`
        <div class="regimen-note">
          Operación exenta de IVA según el artículo 20.Uno.3º de la Ley 37/1992 del IVA (servicios sanitarios)
        </div>
      `:""}

      <table class="importes-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base imponible</td>
            <td>${Ie(a.base_imponible)}</td>
          </tr>
          ${a.porcentaje_iva>0?`
            <tr>
              <td>IVA (${a.porcentaje_iva}%)</td>
              <td>${Ie(a.importe_iva)}</td>
            </tr>
          `:`
            <tr>
              <td>IVA (Exento)</td>
              <td>0,00 €</td>
            </tr>
          `}
          ${a.porcentaje_irpf>0?`
            <tr>
              <td>Retención IRPF (${a.porcentaje_irpf}%)</td>
              <td>-${Ie(a.importe_irpf)}</td>
            </tr>
          `:""}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${Ie(a.total)}</td>
          </tr>
        </tbody>
      </table>

      ${a.estado==="anulada"&&a.motivo_anulacion?`
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #991b1b;">Factura anulada</strong>
          <p style="color: #991b1b; margin-top: 5px;">${a.motivo_anulacion}</p>
        </div>
      `:""}

      <div class="footer">
        <p>Documento generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}</p>
        <p style="margin-top: 5px;">Teraplí - Sistema de gestión para terapeutas</p>
      </div>

      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; margin-right: 10px;">
          Imprimir / Guardar PDF
        </button>
        <button onclick="window.close()" style="background: #e5e7eb; color: #374151; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `,me=window.open("","_blank","width=800,height=600");me?(me.document.write(Re),me.document.close()):alert("Por favor permite las ventanas emergentes para descargar la factura")}function m(a){if(a.paciente?.nombre_completo)return a.paciente.nombre_completo;if(!a.paciente_id)return"Sin paciente";const t=re.value.find(d=>d.id===a.paciente_id);return t?t.nombre_completo:"Paciente no encontrado"}function le(a){const t=new Date(a),d=new Date,o=new Date;o.setDate(d.getDate()-1);const $=new Date;$.setDate(d.getDate()-7);const x=t.toISOString().split("T")[0],i=d.toISOString().split("T")[0],k=o.toISOString().split("T")[0];return x===i?{texto:"Hoy"}:x===k?{texto:"Ayer"}:t>=$?{texto:t.toLocaleDateString("es-ES",{weekday:"short"}),subtexto:t.toLocaleDateString("es-ES",{day:"numeric",month:"short"})}:{texto:t.toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"})}}function Ve(a){return{efectivo:"💵",transferencia:"🏦",bizum:"📱",tarjeta:"💳",stripe:"💻"}[a]||"💰"}function M(a){const t=a.concepto||"",d=t;if(t.toLowerCase().includes("bono")||a.bono_id){const o=t.match(/bono:?\s*([^(]+)\s*\((\d+)\)\s*(\(\d+\/\d+\))?/i);if(o){const $=o[1].trim(),x=o[2],i=o[3]||"";return{tipo:"bono",texto:`${$} ${x}€`,progreso:i,detalleCompleto:d}}return a.bono_id&&a.bono?{tipo:"bono",texto:a.bono.tipo||"Bono",detalleCompleto:d}:{tipo:"bono",texto:t.replace(/pago\s*(de\s*)?sesión\s*(de\s*)?/gi,"").trim()||"Bono",detalleCompleto:d}}return t.toLowerCase().includes("primera")||t.toLowerCase().includes("inicial")?{tipo:"primera",texto:"Primera consulta",detalleCompleto:d}:t.toLowerCase().includes("familiar")?{tipo:"familiar",texto:"Sesión familiar",detalleCompleto:d}:t.toLowerCase().includes("individual")||t.toLowerCase().includes("sesión suelta")?{tipo:"individual",texto:"Sesión individual",detalleCompleto:d}:{tipo:"otro",texto:t||"-",detalleCompleto:d}}function Xe(a){return{bono:"badge-bono",individual:"badge-individual",primera:"badge-primera",familiar:"badge-familiar",otro:"badge-otro"}[a]||"badge-otro"}function ot(a){return{bono:"BONO",individual:"INDIV",primera:"1ª",familiar:"FAM",otro:""}[a]||""}const je=b(null);function ct(a){je.value=je.value===a?null:a}function Oe(){je.value=null}function ut(a){Oe(),alert(`Detalles del pago:

Fecha: ${J(a.fecha_pago)}
Monto: ${A(a.monto)}
Método: ${V(a.metodo_pago)}
Concepto: ${a.concepto||"-"}`)}async function pt(a){if(Oe(),!!confirm(`¿Estás seguro de eliminar este pago de ${A(a.monto)}?`))try{const t=Ye(),{error:d}=await t.from("pagos_registros").delete().eq("id",a.id);if(d)throw d;await be()}catch(t){console.error("Error eliminando pago:",t),alert("Error al eliminar el pago")}}const Ee=b(!1),oe=b(null),He=b(!1),O=b({tipoCliente:"particular",receptorNombre:"",receptorNif:"",receptorDireccion:"",concepto:""});function mt(a){Oe(),oe.value=a,O.value={tipoCliente:"particular",receptorNombre:a.paciente?.nombre_completo||"",receptorNif:"",receptorDireccion:"",concepto:a.concepto||`Sesión de psicología - ${J(a.fecha_pago)}`},Ee.value=!0}const xe=G(()=>oe.value?ve(oe.value.monto,O.value.tipoCliente,"exento"):null);async function vt(){if(oe.value){He.value=!0;try{const a=await N({pacienteId:oe.value.paciente_id||void 0,tipoCliente:O.value.tipoCliente,receptorNombre:O.value.receptorNombre,receptorNif:O.value.receptorNif||void 0,receptorDireccion:O.value.receptorDireccion||void 0,concepto:O.value.concepto,baseImponible:oe.value.monto,pagoId:oe.value.id});a.success?(Ee.value=!1,oe.value=null,await he(),P.value="facturas",alert("Factura generada correctamente")):alert(`Error: ${a.error}`)}catch(a){console.error("Error generando factura:",a),alert("Error al generar la factura")}finally{He.value=!1}}}const ee=b(!1),ke=b(!1),Z=b("mensual"),De=b(new Date().getMonth()+1),pe=b(new Date().getFullYear());function ft(){if(T.value.length===0){alert("No hay pagos para exportar");return}const a=["Fecha","Paciente","Concepto","Método","Monto","ID Pago"],t=T.value.map(i=>[i.fecha_pago,m(i),i.concepto||"",V(i.metodo_pago),i.monto.toFixed(2),i.id]),d=[a.join(";"),...t.map(i=>i.map(k=>`"${String(k).replace(/"/g,'""')}"`).join(";"))].join(`
`),o=new Blob(["\uFEFF"+d],{type:"text/csv;charset=utf-8;"}),$=URL.createObjectURL(o),x=document.createElement("a");x.href=$,x.download=`pagos_${w.value.fechaDesde||"todos"}_${w.value.fechaHasta||new Date().toISOString().split("T")[0]}.csv`,x.click(),URL.revokeObjectURL($),ee.value=!1}function gt(){if(E.value.length===0){alert("No hay facturas para exportar");return}const a=["Nº Factura","Fecha","Cliente","NIF","Base Imponible","IVA","IRPF","Total","Estado"],t=E.value.map(i=>[i.numero_factura,i.fecha_emision,i.receptor_nombre,i.receptor_nif||"",i.base_imponible.toFixed(2),i.importe_iva.toFixed(2),i.importe_irpf.toFixed(2),i.total.toFixed(2),i.estado]),d=[a.join(";"),...t.map(i=>i.map(k=>`"${String(k).replace(/"/g,'""')}"`).join(";"))].join(`
`),o=new Blob(["\uFEFF"+d],{type:"text/csv;charset=utf-8;"}),$=URL.createObjectURL(o),x=document.createElement("a");x.href=$,x.download=`facturas_${new Date().toISOString().split("T")[0]}.csv`,x.click(),URL.revokeObjectURL($),ee.value=!1}function at(){if(T.value.length===0&&E.value.length===0){alert("No hay datos para exportar");return}const a=R.value,t=new Date().toLocaleDateString("es-ES");let d="\uFEFF";if(d+=`INFORME CONTABLE
`,d+=`Período;${a}
`,d+=`Fecha generación;${t}
`,d+=`Terapeuta;${p.value?.nombre_completo||""}
`,d+=`NIF;${p.value?.nif||""}
`,d+=`
`,d+=`RESUMEN FINANCIERO
`,d+=`Total cobrado;${F.value.totalCobrado.toFixed(2)} €
`,d+=`Número de pagos;${F.value.cantidadPagos}
`,d+=`Promedio por pago;${F.value.promedioPorPago.toFixed(2)} €
`,d+=`
DESGLOSE POR MÉTODO DE PAGO
`,d+=`Método;Cantidad;Total
`,Object.entries(F.value.porMetodo).forEach(([i,k])=>{d+=`${V(i)};${k.cantidad};${k.total.toFixed(2)} €
`}),E.value.length>0){const i=E.value.filter(k=>k.estado==="emitida");d+=`
RESUMEN FACTURAS
`,d+=`Total facturas emitidas;${i.length}
`,d+=`Base imponible total;${ie.value.totalBase.toFixed(2)} €
`,d+=`IVA repercutido;${ie.value.totalIVA.toFixed(2)} €
`,d+=`Retenciones IRPF;${ie.value.totalIRPF.toFixed(2)} €
`,d+=`Total facturado;${ie.value.totalFacturado.toFixed(2)} €
`}d+=`

DETALLE DE PAGOS
`,d+=`Fecha;Paciente;Concepto;Método;Monto;Factura asociada
`,T.value.forEach(i=>{const k=E.value.find($e=>$e.pago_id===i.id);d+=`${i.fecha_pago};${m(i)};${(i.concepto||"").replace(/;/g,",")};${V(i.metodo_pago)};${i.monto.toFixed(2)};${k?.numero_factura||""}
`}),E.value.length>0&&(d+=`

DETALLE DE FACTURAS
`,d+=`Nº Factura;Fecha;Cliente;NIF;Base Imponible;% IVA;IVA;% IRPF;IRPF;Total;Estado
`,E.value.forEach(i=>{d+=`${i.numero_factura};${i.fecha_emision};${i.receptor_nombre};${i.receptor_nif||""};${i.base_imponible.toFixed(2)};${i.porcentaje_iva};${i.importe_iva.toFixed(2)};${i.porcentaje_irpf};${i.importe_irpf.toFixed(2)};${i.total.toFixed(2)};${i.estado}
`}));const o=new Blob([d],{type:"text/csv;charset=utf-8;"}),$=URL.createObjectURL(o),x=document.createElement("a");x.href=$,x.download=`informe_contable_${w.value.fechaDesde||"todos"}_${w.value.fechaHasta||new Date().toISOString().split("T")[0]}.csv`,x.click(),URL.revokeObjectURL($),ee.value=!1}function bt(a="mensual"){const t=p.value?.nombre_completo||"Terapeuta",d=p.value?.nif||"",o=new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});let $="",x="",i="";if(a==="mensual"){const I=De.value,z=pe.value;$=new Date(z,I-1).toLocaleDateString("es-ES",{month:"long",year:"numeric"}),x=new Date(z,I-1,1).toISOString().split("T")[0],i=new Date(z,I,0).toISOString().split("T")[0]}else if(a==="trimestral"){const I=Math.floor((De.value-1)/3)+1,z=pe.value;$=`${I}º Trimestre ${z}`,x=new Date(z,(I-1)*3,1).toISOString().split("T")[0],i=new Date(z,I*3,0).toISOString().split("T")[0]}else $=`Año ${pe.value}`,x=`${pe.value}-01-01`,i=`${pe.value}-12-31`;const k=T.value.filter(I=>I.fecha_pago>=x&&I.fecha_pago<=i),$e=E.value.filter(I=>I.fecha_emision>=x&&I.fecha_emision<=i),Ie=k.reduce((I,z)=>I+z.monto,0),Re=k.length,me=$e.filter(I=>I.estado==="emitida"),Qe=me.reduce((I,z)=>I+z.total,0),ht=me.reduce((I,z)=>I+z.base_imponible,0),wt=me.reduce((I,z)=>I+z.importe_iva,0),yt=me.reduce((I,z)=>I+z.importe_irpf,0),Ne={};k.forEach(I=>{const z=I.metodo_pago||"otro";Ne[z]||(Ne[z]={cantidad:0,total:0}),Ne[z].cantidad++,Ne[z].total+=I.monto});const we=I=>new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(I),_t=`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Informe ${a} - ${$}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: #333;
          padding: 30px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 3px solid #7c3aed;
          margin-bottom: 25px;
        }
        .header h1 { font-size: 22px; color: #7c3aed; margin-bottom: 5px; }
        .header p { color: #666; font-size: 12px; }
        .header-right { text-align: right; }
        .header-right .periodo {
          background: #7c3aed;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
        }
        .resumen-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .resumen-card {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          padding: 15px;
          border-radius: 10px;
          text-align: center;
        }
        .resumen-card.principal {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
        }
        .resumen-card .valor {
          font-size: 22px;
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }
        .resumen-card .label { font-size: 10px; text-transform: uppercase; opacity: 0.8; }
        .seccion { margin-bottom: 25px; }
        .seccion h2 {
          font-size: 14px;
          color: #7c3aed;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .tabla-simple {
          width: 100%;
          border-collapse: collapse;
        }
        .tabla-simple th, .tabla-simple td {
          padding: 8px 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .tabla-simple th {
          background: #f9fafb;
          font-weight: 500;
          color: #666;
          font-size: 10px;
          text-transform: uppercase;
        }
        .tabla-simple td.numero { text-align: right; font-family: monospace; }
        .tabla-simple tr:hover { background: #f5f3ff; }
        .metodos-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        .metodo-card {
          background: #f9fafb;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }
        .metodo-card .emoji { font-size: 18px; }
        .metodo-card .nombre { font-size: 10px; color: #666; margin: 5px 0 3px; }
        .metodo-card .total { font-weight: 600; }
        .fiscal-box {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        .fiscal-box h3 { color: #92400e; font-size: 12px; margin-bottom: 10px; }
        .fiscal-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dashed #fcd34d;
        }
        .fiscal-row:last-child { border-bottom: none; font-weight: bold; }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 9px;
        }
        .no-print { margin-top: 20px; text-align: center; }
        @media print { .no-print { display: none; } body { padding: 15px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>INFORME ${a.toUpperCase()}</h1>
          <p>Resumen ejecutivo de actividad financiera</p>
        </div>
        <div class="header-right">
          <div class="periodo">${$}</div>
          <p style="margin-top: 10px; color: #666;">
            ${t}<br>
            ${d?`NIF: ${d}`:""}
          </p>
        </div>
      </div>

      <div class="resumen-grid">
        <div class="resumen-card principal">
          <span class="valor">${we(Ie)}</span>
          <span class="label">Total cobrado</span>
        </div>
        <div class="resumen-card">
          <span class="valor">${Re}</span>
          <span class="label">Pagos recibidos</span>
        </div>
        <div class="resumen-card">
          <span class="valor">${me.length}</span>
          <span class="label">Facturas emitidas</span>
        </div>
        <div class="resumen-card">
          <span class="valor">${we(Re>0?Ie/Re:0)}</span>
          <span class="label">Promedio por pago</span>
        </div>
      </div>

      <div class="seccion">
        <h2>Desglose por método de pago</h2>
        <div class="metodos-grid">
          ${Object.entries(Ne).map(([I,z])=>`
            <div class="metodo-card">
              <div class="emoji">${Ve(I)}</div>
              <div class="nombre">${V(I)}</div>
              <div class="total">${we(z.total)}</div>
              <div style="font-size: 9px; color: #888;">${z.cantidad} pagos</div>
            </div>
          `).join("")}
        </div>
      </div>

      ${me.length>0?`
        <div class="fiscal-box">
          <h3>Resumen fiscal - Declaración IVA/IRPF</h3>
          <div class="fiscal-row">
            <span>Base imponible total</span>
            <span>${we(ht)}</span>
          </div>
          <div class="fiscal-row">
            <span>IVA repercutido (21%)</span>
            <span>${we(wt)}</span>
          </div>
          <div class="fiscal-row">
            <span>Retenciones IRPF (15%)</span>
            <span>-${we(yt)}</span>
          </div>
          <div class="fiscal-row">
            <span>Total facturado</span>
            <span>${we(Qe)}</span>
          </div>
        </div>
      `:""}

      ${k.length>0?`
        <div class="seccion" style="margin-top: 25px;">
          <h2>Últimos movimientos (${Math.min(10,k.length)} de ${k.length})</h2>
          <table class="tabla-simple">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Concepto</th>
                <th style="text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${k.slice(0,10).map(I=>`
                <tr>
                  <td>${new Date(I.fecha_pago).toLocaleDateString("es-ES")}</td>
                  <td>${m(I)}</td>
                  <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${I.concepto||"-"}</td>
                  <td class="numero">${we(I.monto)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `:'<p style="color: #888; text-align: center; padding: 20px;">No hay movimientos en este período</p>'}

      <div class="footer">
        <p>Informe generado el ${o} · Teraplí - Sistema de gestión para terapeutas</p>
        <p style="margin-top: 5px;">Este documento es un resumen informativo. Consulte con su asesor fiscal para declaraciones oficiales.</p>
      </div>

      <div class="no-print">
        <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; margin-right: 10px;">
          Imprimir / Guardar PDF
        </button>
        <button onclick="window.close()" style="background: #e5e7eb; color: #374151; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `,We=window.open("","_blank","width=850,height=700");We?(We.document.write(_t),We.document.close()):alert("Por favor permite las ventanas emergentes para generar el informe"),ke.value=!1}function st(){if(E.value.length===0){alert("No hay facturas para exportar");return}const a=E.value.filter(k=>k.estado==="emitida"),t=["Tipo","Número","Fecha","NIF Cliente","Nombre Cliente","Base Imponible","Tipo IVA","Cuota IVA","Tipo Retención","Cuota Retención","Total Factura","Forma Pago","Cuenta Contable"],d=a.map(k=>["E",k.numero_factura,k.fecha_emision,k.receptor_nif||"",k.receptor_nombre,k.base_imponible.toFixed(2),k.porcentaje_iva.toString(),k.importe_iva.toFixed(2),k.porcentaje_irpf.toString(),k.importe_irpf.toFixed(2),k.total.toFixed(2),"01","7050001"]),o=[t.join(";"),...d.map(k=>k.map($e=>`"${String($e).replace(/"/g,'""')}"`).join(";"))].join(`
`),$=new Blob(["\uFEFF"+o],{type:"text/csv;charset=utf-8;"}),x=URL.createObjectURL($),i=document.createElement("a");i.href=x,i.download=`facturas_contabilidad_${new Date().toISOString().split("T")[0]}.csv`,i.click(),URL.revokeObjectURL(x),ee.value=!1}const ie=G(()=>{const a=E.value.filter(x=>x.estado==="emitida"),t=a.reduce((x,i)=>x+i.total,0),d=a.reduce((x,i)=>x+i.base_imponible,0),o=a.reduce((x,i)=>x+i.importe_iva,0),$=a.reduce((x,i)=>x+i.importe_irpf,0);return{cantidad:a.length,totalFacturado:t,totalBase:d,totalIVA:o,totalIRPF:$,anuladas:E.value.filter(x=>x.estado==="anulada").length}});function xt(){X.value=!1,be(),he()}return Te(P,a=>{a==="pagos"?be():he()}),Te(c,be),Te(s,he),lt(async()=>{await fe(),await ce(),be()}),(a,t)=>{const d=Ko;return n(),r("div",Xo,[e("header",Qo,[e("div",Wo,[t[44]||(t[44]=e("h1",null,"Pagos y Facturación",-1)),e("button",{class:"btn-primary",onClick:t[0]||(t[0]=o=>X.value=!0)},[...t[43]||(t[43]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"icon"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M12 4.5v15m7.5-7.5h-15"})],-1),j(" Nuevo Pago ",-1)])])])]),e("div",ea,[e("button",{class:H(["tab",{active:P.value==="pagos"}]),onClick:t[1]||(t[1]=o=>P.value="pagos")},[t[45]||(t[45]=j(" Pagos ",-1)),u.value>0?(n(),r("span",ta,l(u.value),1)):h("",!0)],2),e("button",{class:H(["tab",{active:P.value==="facturas"}]),onClick:t[2]||(t[2]=o=>P.value="facturas")},[t[46]||(t[46]=j(" Facturas ",-1)),g.value>0?(n(),r("span",oa,l(g.value),1)):h("",!0)],2)]),ue.value&&P.value==="pagos"?(n(),r("div",aa,[t[48]||(t[48]=e("div",{class:"alerta-icono"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"})])],-1)),e("div",sa,[e("p",na,l(q.value.length)+" pago(s) requieren revisión",1),t[47]||(t[47]=e("p",{class:"alerta-descripcion"},' Estos pagos tienen un paciente_id pero el paciente ya no existe o fue eliminado. Puedes asignar manualmente un paciente haciendo clic en "Asignar" en la fila correspondiente. ',-1))])])):h("",!0),P.value==="pagos"&&T.value.length>0?(n(),r("div",ra,[e("div",la,[t[50]||(t[50]=e("div",{class:"metrica-icono"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})])],-1)),e("div",ia,[e("span",da,l(C(A)(F.value.totalCobrado)),1),t[49]||(t[49]=e("span",{class:"metrica-label"},"Total cobrado",-1))])]),e("div",ca,[t[52]||(t[52]=e("div",{class:"metrica-icono metrica-icono-secundario"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"})])],-1)),e("div",ua,[e("span",pa,l(F.value.cantidadPagos),1),t[51]||(t[51]=e("span",{class:"metrica-label"},"Pagos",-1))])]),e("div",ma,[t[54]||(t[54]=e("div",{class:"metrica-icono metrica-icono-secundario"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"})])],-1)),e("div",va,[e("span",fa,l(C(A)(F.value.promedioPorPago)),1),t[53]||(t[53]=e("span",{class:"metrica-label"},"Promedio",-1))])]),e("div",ga,[t[55]||(t[55]=e("div",{class:"metrica-icono metrica-icono-secundario"},[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"})])],-1)),e("div",ba,[e("span",xa,l(F.value.metodoMasUsado.nombre),1),e("span",ha,"Método principal ("+l(F.value.metodoMasUsado.porcentaje)+"%)",1)])])])):h("",!0),P.value==="pagos"?(n(),r("div",wa,[(n(),r(de,null,ye(v,o=>e("button",{key:o.id,class:H(["chip-filtro",{"chip-activo":Q.value===o.id}]),onClick:$=>f(o.id)},l(o.label),11,ya)),64))])):h("",!0),e("div",_a,[e("div",ka,[t[56]||(t[56]=e("label",null,"Desde",-1)),B(e("input",{type:"date","onUpdate:modelValue":t[3]||(t[3]=o=>w.value.fechaDesde=o),class:"input-date",onChange:t[4]||(t[4]=o=>Q.value=null)},null,544),[[ae,w.value.fechaDesde]])]),e("div",$a,[t[57]||(t[57]=e("label",null,"Hasta",-1)),B(e("input",{type:"date","onUpdate:modelValue":t[5]||(t[5]=o=>w.value.fechaHasta=o),class:"input-date",onChange:t[6]||(t[6]=o=>Q.value=null)},null,544),[[ae,w.value.fechaHasta]])]),e("div",Ia,[t[59]||(t[59]=e("label",null,"Paciente",-1)),B(e("select",{"onUpdate:modelValue":t[7]||(t[7]=o=>w.value.pacienteId=o),class:"input-select"},[t[58]||(t[58]=e("option",{value:""},"Todos",-1)),(n(!0),r(de,null,ye(C(re),o=>(n(),r("option",{key:o.id,value:o.id},l(o.nombre_completo),9,Ca))),128))],512),[[Se,w.value.pacienteId]])]),P.value==="pagos"?(n(),r("div",Fa,[t[61]||(t[61]=e("label",null,"Método",-1)),B(e("select",{"onUpdate:modelValue":t[8]||(t[8]=o=>w.value.metodoPago=o),class:"input-select"},[...t[60]||(t[60]=[It('<option value="" data-v-3a9bae83>Todos</option><option value="efectivo" data-v-3a9bae83>Efectivo</option><option value="transferencia" data-v-3a9bae83>Transferencia</option><option value="bizum" data-v-3a9bae83>Bizum</option><option value="tarjeta" data-v-3a9bae83>Tarjeta</option>',5)])],512),[[Se,w.value.metodoPago]])])):h("",!0),P.value==="facturas"?(n(),r("div",Pa,[t[63]||(t[63]=e("label",null,"Estado",-1)),B(e("select",{"onUpdate:modelValue":t[9]||(t[9]=o=>w.value.estado=o),class:"input-select"},[...t[62]||(t[62]=[e("option",{value:""},"Todos",-1),e("option",{value:"emitida"},"Emitida",-1),e("option",{value:"borrador"},"Borrador",-1),e("option",{value:"anulada"},"Anulada",-1)])],512),[[Se,w.value.estado]])])):h("",!0),e("div",{class:"filtro-acciones"},[e("button",{class:"btn-secondary",onClick:Me},"Filtrar"),e("button",{class:"btn-text",onClick:Pe},"Limpiar")])]),P.value==="pagos"&&T.value.length>0?(n(),r("div",Ea,[e("div",Da,[e("span",Sa,l(R.value),1),e("span",Ma,l(F.value.cantidadPagos)+" pagos · "+l(C(A)(F.value.totalCobrado)),1)]),e("div",Aa,[e("button",{class:"btn-exportar",onClick:t[10]||(t[10]=o=>ee.value=!ee.value),title:"Exportar e Informes"},[t[65]||(t[65]=e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"})],-1)),t[66]||(t[66]=j(" Exportar ",-1)),(n(),r("svg",{class:H(["dropdown-arrow",{rotated:ee.value}]),xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"2",stroke:"currentColor"},[...t[64]||(t[64]=[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M19 9l-7 7-7-7"},null,-1)])],2))]),te(Be,{name:"dropdown"},{default:Ue(()=>[ee.value?(n(),r("div",Va,[e("div",{class:"dropdown-section"},[t[70]||(t[70]=e("span",{class:"dropdown-section-title"},"Exportar datos",-1)),e("button",{onClick:ft,class:"dropdown-item"},[...t[67]||(t[67]=[e("span",{class:"dropdown-icon"},"📄",-1),e("span",null,"CSV simple (pagos)",-1)])]),e("button",{onClick:at,class:"dropdown-item"},[...t[68]||(t[68]=[e("span",{class:"dropdown-icon"},"📊",-1),e("span",null,"Excel contable completo",-1)])]),e("button",{onClick:st,class:"dropdown-item"},[...t[69]||(t[69]=[e("span",{class:"dropdown-icon"},"🏦",-1),e("span",null,"Formato software contable",-1)])])]),t[73]||(t[73]=e("div",{class:"dropdown-divider"},null,-1)),e("div",ja,[t[72]||(t[72]=e("span",{class:"dropdown-section-title"},"Informes PDF",-1)),e("button",{onClick:t[11]||(t[11]=o=>{ke.value=!0,ee.value=!1}),class:"dropdown-item"},[...t[71]||(t[71]=[e("span",{class:"dropdown-icon"},"📋",-1),e("span",null,"Generar informe...",-1)])])])])):h("",!0)]),_:1})])])):h("",!0),P.value==="facturas"&&E.value.length>0?(n(),r("div",Ra,[e("div",Na,[e("span",Ta,l(ie.value.cantidad),1),t[74]||(t[74]=e("span",{class:"metrica-factura-label"},"Emitidas",-1))]),e("div",za,[e("span",Ba,l(C(A)(ie.value.totalFacturado)),1),t[75]||(t[75]=e("span",{class:"metrica-factura-label"},"Total facturado",-1))]),e("div",Ua,[e("span",La,l(C(A)(ie.value.totalBase)),1),t[76]||(t[76]=e("span",{class:"metrica-factura-label"},"Base imponible",-1))]),ie.value.totalIVA>0?(n(),r("div",Oa,[e("span",Ha,l(C(A)(ie.value.totalIVA)),1),t[77]||(t[77]=e("span",{class:"metrica-factura-label"},"IVA repercutido",-1))])):h("",!0),ie.value.totalIRPF>0?(n(),r("div",qa,[e("span",Ga,"-"+l(C(A)(ie.value.totalIRPF)),1),t[78]||(t[78]=e("span",{class:"metrica-factura-label"},"Retención IRPF",-1))])):h("",!0),e("div",Ya,[e("button",{class:"btn-exportar",onClick:t[12]||(t[12]=o=>ee.value=!ee.value),title:"Exportar e Informes"},[t[80]||(t[80]=e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"})],-1)),t[81]||(t[81]=j(" Exportar ",-1)),(n(),r("svg",{class:H(["dropdown-arrow",{rotated:ee.value}]),xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"2",stroke:"currentColor"},[...t[79]||(t[79]=[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M19 9l-7 7-7-7"},null,-1)])],2))]),te(Be,{name:"dropdown"},{default:Ue(()=>[ee.value?(n(),r("div",Za,[e("div",{class:"dropdown-section"},[t[85]||(t[85]=e("span",{class:"dropdown-section-title"},"Exportar datos",-1)),e("button",{onClick:gt,class:"dropdown-item"},[...t[82]||(t[82]=[e("span",{class:"dropdown-icon"},"📄",-1),e("span",null,"CSV facturas",-1)])]),e("button",{onClick:at,class:"dropdown-item"},[...t[83]||(t[83]=[e("span",{class:"dropdown-icon"},"📊",-1),e("span",null,"Excel contable completo",-1)])]),e("button",{onClick:st,class:"dropdown-item"},[...t[84]||(t[84]=[e("span",{class:"dropdown-icon"},"🏦",-1),e("span",null,"Formato software contable",-1)])])]),t[88]||(t[88]=e("div",{class:"dropdown-divider"},null,-1)),e("div",Ja,[t[87]||(t[87]=e("span",{class:"dropdown-section-title"},"Informes PDF",-1)),e("button",{onClick:t[13]||(t[13]=o=>{ke.value=!0,ee.value=!1}),class:"dropdown-item"},[...t[86]||(t[86]=[e("span",{class:"dropdown-icon"},"📋",-1),e("span",null,"Generar informe...",-1)])])])])):h("",!0)]),_:1})])])):h("",!0),S.value?(n(),r("div",Ka,[...t[89]||(t[89]=[e("div",{class:"spinner"},null,-1),e("p",null,"Cargando...",-1)])])):P.value==="pagos"?(n(),r("div",{key:6,class:"table-container",onClick:Oe},[T.value.length>0?(n(),r("table",Xa,[t[94]||(t[94]=e("thead",null,[e("tr",null,[e("th",null,"Fecha"),e("th",null,"Paciente"),e("th",null,"Concepto"),e("th",null,"Método"),e("th",{class:"text-right"},"Monto"),e("th",{class:"text-center"},"Acciones")])],-1)),e("tbody",null,[(n(!0),r(de,null,ye(T.value,o=>(n(),r("tr",{key:o.id,class:H({"fila-problema":Fe(o)})},[e("td",Qa,[e("div",Wa,[e("span",es,l(le(o.fecha_pago).texto),1),le(o.fecha_pago).subtexto?(n(),r("span",ts,l(le(o.fecha_pago).subtexto),1)):h("",!0)])]),e("td",null,[e("span",{class:H({"paciente-problema":Fe(o)})},l(m(o)),3),Fe(o)?(n(),r("span",os,"ID huérfano")):h("",!0)]),e("td",as,[e("div",ss,[ot(M(o).tipo)?(n(),r("span",{key:0,class:H(["concepto-badge",Xe(M(o).tipo)])},l(ot(M(o).tipo)),3)):h("",!0),e("span",{class:"concepto-texto",title:M(o).detalleCompleto},l(M(o).texto),9,ns),M(o).progreso?(n(),r("span",rs,l(M(o).progreso),1)):h("",!0)])]),e("td",null,[e("span",ls,[e("span",is,l(Ve(o.metodo_pago)),1),j(" "+l(C(V)(o.metodo_pago)),1)])]),e("td",ds,l(C(A)(o.monto)),1),e("td",cs,[e("div",us,[Fe(o)?(n(),r("button",{key:0,class:"btn-asignar",onClick:_e($=>Je(o),["stop"]),title:"Asignar paciente"}," Asignar ",8,ps)):(n(),r("div",ms,[e("button",{class:H(["btn-menu",{"menu-activo":je.value===o.id}]),onClick:_e($=>ct(o.id),["stop"])},[...t[90]||(t[90]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"})],-1)])],10,vs),te(Be,{name:"menu-fade"},{default:Ue(()=>[je.value===o.id?(n(),r("div",{key:0,class:"menu-dropdown",onClick:t[14]||(t[14]=_e(()=>{},["stop"]))},[e("button",{class:"menu-item",onClick:$=>ut(o)},[...t[91]||(t[91]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"}),e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"})],-1),j(" Ver detalles ",-1)])],8,fs),e("button",{class:"menu-item",onClick:$=>mt(o)},[...t[92]||(t[92]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"})],-1),j(" Generar factura ",-1)])],8,gs),e("button",{class:"menu-item menu-item-danger",onClick:$=>pt(o)},[...t[93]||(t[93]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})],-1),j(" Eliminar ",-1)])],8,bs)])):h("",!0)]),_:2},1024)]))])])],2))),128))])])):(n(),r("div",xs,[t[95]||(t[95]=e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"empty-icon"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"})],-1)),t[96]||(t[96]=e("p",null,"No hay pagos registrados",-1)),e("button",{class:"btn-primary",onClick:t[15]||(t[15]=o=>X.value=!0)},"Registrar primer pago")])),T.value.length>0?(n(),r("div",hs,[e("button",{disabled:c.value===1,onClick:t[16]||(t[16]=o=>c.value--),class:"btn-pag"}," Anterior ",8,ws),e("span",ys,"Página "+l(c.value),1),e("button",{disabled:T.value.length<qe,onClick:t[17]||(t[17]=o=>c.value++),class:"btn-pag"}," Siguiente ",8,_s)])):h("",!0)])):(n(),r("div",ks,[E.value.length>0?(n(),r("table",$s,[t[99]||(t[99]=e("thead",null,[e("tr",null,[e("th",null,"Nº Factura"),e("th",null,"Fecha"),e("th",null,"Cliente"),e("th",null,"Concepto"),e("th",{class:"text-right"},"Base"),e("th",{class:"text-right"},"Total"),e("th",null,"Estado"),e("th",null,"Acciones")])],-1)),e("tbody",null,[(n(!0),r(de,null,ye(E.value,o=>(n(),r("tr",{key:o.id},[e("td",Is,l(o.numero_factura),1),e("td",Cs,l(C(J)(o.fecha_emision)),1),e("td",null,[e("div",Fs,[e("span",Ps,l(o.receptor_nombre),1),o.receptor_nif?(n(),r("span",Es,l(o.receptor_nif),1)):h("",!0)])]),e("td",Ds,l(o.concepto),1),e("td",Ss,l(C(A)(o.base_imponible)),1),e("td",Ms,l(C(A)(o.total)),1),e("td",null,[e("span",{class:H(["estado-badge",C(K)(o.estado)])},l(o.estado),3)]),e("td",As,[e("button",{class:"btn-icon",title:"Descargar PDF",onClick:$=>D(o)},[...t[97]||(t[97]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"})],-1)])],8,Vs),o.estado==="emitida"?(n(),r("button",{key:0,class:"btn-icon btn-danger",title:"Anular factura",onClick:$=>Ae(o)},[...t[98]||(t[98]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M6 18L18 6M6 6l12 12"})],-1)])],8,js)):h("",!0)])]))),128))])])):(n(),r("div",Rs,[...t[100]||(t[100]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"empty-icon"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"})],-1),e("p",null,"No hay facturas emitidas",-1),e("p",{class:"text-muted"},"Las facturas se generan al registrar pagos",-1)])])),E.value.length>0?(n(),r("div",Ns,[e("button",{disabled:s.value===1,onClick:t[18]||(t[18]=o=>s.value--),class:"btn-pag"}," Anterior ",8,Ts),e("span",zs,"Página "+l(s.value),1),e("button",{disabled:E.value.length<qe,onClick:t[19]||(t[19]=o=>s.value++),class:"btn-pag"}," Siguiente ",8,Bs)])):h("",!0)])),te(d,{visible:X.value,onClose:t[20]||(t[20]=o=>X.value=!1),onSaved:xt},null,8,["visible"]),(n(),Le(Ge,{to:"body"},[se.value?(n(),r("div",{key:0,class:"modal-overlay",onClick:t[24]||(t[24]=_e(o=>se.value=!1,["self"]))},[e("div",Us,[e("div",Ls,[t[102]||(t[102]=e("h3",null,"Asignar Paciente",-1)),e("button",{class:"btn-close",onClick:t[21]||(t[21]=o=>se.value=!1)},[...t[101]||(t[101]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M6 18L18 6M6 6l12 12"})],-1)])])]),e("div",Os,[t[109]||(t[109]=e("p",{class:"modal-info"}," Este pago tiene un ID de paciente que ya no existe en el sistema. Selecciona un paciente para asignarlo correctamente. ",-1)),ne.value?(n(),r("div",Hs,[e("p",null,[t[103]||(t[103]=e("strong",null,"Fecha:",-1)),j(" "+l(C(J)(ne.value.fecha_pago)),1)]),e("p",null,[t[104]||(t[104]=e("strong",null,"Monto:",-1)),j(" "+l(C(A)(ne.value.monto)),1)]),e("p",null,[t[105]||(t[105]=e("strong",null,"Concepto:",-1)),j(" "+l(ne.value.concepto||"-"),1)]),e("p",qs,[t[106]||(t[106]=e("strong",null,"ID huérfano:",-1)),j(" "+l(ne.value.paciente_id),1)])])):h("",!0),e("div",Gs,[t[108]||(t[108]=e("label",{for:"paciente-select"},"Seleccionar paciente:",-1)),B(e("select",{id:"paciente-select","onUpdate:modelValue":t[22]||(t[22]=o=>ge.value=o),class:"input-select"},[t[107]||(t[107]=e("option",{value:""},"-- Seleccionar --",-1)),(n(!0),r(de,null,ye(C(re),o=>(n(),r("option",{key:o.id,value:o.id},l(o.nombre_completo),9,Ys))),128))],512),[[Se,ge.value]])])]),e("div",Zs,[e("button",{class:"btn-secondary",onClick:t[23]||(t[23]=o=>se.value=!1)}," Cancelar "),e("button",{class:"btn-primary",disabled:!ge.value||Ce.value,onClick:Ke},[Ce.value?(n(),r("span",Ks,"Asignando...")):(n(),r("span",Xs,"Asignar Paciente"))],8,Js)])])])):h("",!0)])),(n(),Le(Ge,{to:"body"},[Ee.value?(n(),r("div",{key:0,class:"modal-overlay",onClick:t[33]||(t[33]=_e(o=>Ee.value=!1,["self"]))},[e("div",Qs,[e("div",Ws,[t[111]||(t[111]=e("h3",null,"Generar Factura",-1)),e("button",{class:"btn-close",onClick:t[25]||(t[25]=o=>Ee.value=!1)},[...t[110]||(t[110]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M6 18L18 6M6 6l12 12"})],-1)])])]),e("div",en,[oe.value?(n(),r("div",tn,[e("div",on,[t[112]||(t[112]=e("span",{class:"monto-label"},"Monto del pago",-1)),e("span",an,l(C(A)(oe.value.monto)),1)]),e("div",sn,[e("span",null,l(C(J)(oe.value.fecha_pago)),1),e("span",nn,l(Ve(oe.value.metodo_pago))+" "+l(C(V)(oe.value.metodo_pago)),1)])])):h("",!0),e("div",rn,[t[115]||(t[115]=e("label",null,"Tipo de cliente",-1)),e("div",ln,[e("button",{class:H(["tipo-btn",{active:O.value.tipoCliente==="particular"}]),onClick:t[26]||(t[26]=o=>O.value.tipoCliente="particular")},[...t[113]||(t[113]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"})],-1),j(" Particular ",-1),e("span",{class:"tipo-info"},"Sin IVA (exento)",-1)])],2),e("button",{class:H(["tipo-btn",{active:O.value.tipoCliente==="empresa"}]),onClick:t[27]||(t[27]=o=>O.value.tipoCliente="empresa")},[...t[114]||(t[114]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"})],-1),j(" Empresa ",-1),e("span",{class:"tipo-info"},"IVA 21% - IRPF 15%",-1)])],2)])]),e("div",dn,[t[116]||(t[116]=e("label",{for:"receptor-nombre"},"Nombre del receptor *",-1)),B(e("input",{id:"receptor-nombre","onUpdate:modelValue":t[28]||(t[28]=o=>O.value.receptorNombre=o),type:"text",class:"input-text",placeholder:"Nombre completo o razón social"},null,512),[[ae,O.value.receptorNombre]])]),O.value.tipoCliente==="empresa"?(n(),r("div",cn,[e("div",un,[t[117]||(t[117]=e("label",{for:"receptor-nif"},"NIF/CIF *",-1)),B(e("input",{id:"receptor-nif","onUpdate:modelValue":t[29]||(t[29]=o=>O.value.receptorNif=o),type:"text",class:"input-text",placeholder:"B12345678"},null,512),[[ae,O.value.receptorNif]])]),e("div",pn,[t[118]||(t[118]=e("label",{for:"receptor-direccion"},"Dirección",-1)),B(e("input",{id:"receptor-direccion","onUpdate:modelValue":t[30]||(t[30]=o=>O.value.receptorDireccion=o),type:"text",class:"input-text",placeholder:"Calle, número, ciudad"},null,512),[[ae,O.value.receptorDireccion]])])])):h("",!0),e("div",mn,[t[119]||(t[119]=e("label",{for:"concepto"},"Concepto *",-1)),B(e("textarea",{id:"concepto","onUpdate:modelValue":t[31]||(t[31]=o=>O.value.concepto=o),class:"input-textarea",rows:"2",placeholder:"Descripción del servicio"},null,512),[[ae,O.value.concepto]])]),xe.value?(n(),r("div",vn,[e("div",fn,[t[120]||(t[120]=e("span",null,"Base imponible",-1)),e("span",null,l(C(A)(xe.value.baseImponible)),1)]),xe.value.porcentajeIVA>0?(n(),r("div",gn,[e("span",null,"IVA ("+l(xe.value.porcentajeIVA)+"%)",1),e("span",null,"+ "+l(C(A)(xe.value.importeIVA)),1)])):h("",!0),xe.value.porcentajeIRPF>0?(n(),r("div",bn,[e("span",null,"Retención IRPF ("+l(xe.value.porcentajeIRPF)+"%)",1),e("span",xn,"- "+l(C(A)(xe.value.importeIRPF)),1)])):h("",!0),e("div",hn,[t[121]||(t[121]=e("span",null,"Total factura",-1)),e("span",null,l(C(A)(xe.value.total)),1)])])):h("",!0)]),e("div",wn,[e("button",{class:"btn-secondary",onClick:t[32]||(t[32]=o=>Ee.value=!1)}," Cancelar "),e("button",{class:"btn-primary",disabled:!O.value.receptorNombre||!O.value.concepto||He.value,onClick:vt},[He.value?(n(),r("span",_n,"Generando...")):(n(),r("span",kn,"Generar Factura"))],8,yn)])])])):h("",!0)])),(n(),Le(Ge,{to:"body"},[ke.value?(n(),r("div",{key:0,class:"modal-overlay",onClick:t[42]||(t[42]=_e(o=>ke.value=!1,["self"]))},[e("div",$n,[e("div",In,[t[123]||(t[123]=e("h3",null,"Generar Informe",-1)),e("button",{class:"btn-close",onClick:t[34]||(t[34]=o=>ke.value=!1)},[...t[122]||(t[122]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"2",stroke:"currentColor",width:"20",height:"20"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M6 18L18 6M6 6l12 12"})],-1)])])]),e("div",Cn,[t[134]||(t[134]=e("p",{class:"informe-descripcion"}," Genera un informe PDF con resumen ejecutivo de tu actividad financiera para tu contador o declaraciones fiscales. ",-1)),e("div",Fn,[e("label",{class:H(["informe-tipo-option",{selected:Z.value==="mensual"}])},[B(e("input",{type:"radio","onUpdate:modelValue":t[35]||(t[35]=o=>Z.value=o),value:"mensual"},null,512),[[ze,Z.value]]),t[124]||(t[124]=e("div",{class:"informe-tipo-content"},[e("span",{class:"informe-tipo-icon"},"📅"),e("span",{class:"informe-tipo-label"},"Mensual"),e("span",{class:"informe-tipo-desc"},"Para contador mensual")],-1))],2),e("label",{class:H(["informe-tipo-option",{selected:Z.value==="trimestral"}])},[B(e("input",{type:"radio","onUpdate:modelValue":t[36]||(t[36]=o=>Z.value=o),value:"trimestral"},null,512),[[ze,Z.value]]),t[125]||(t[125]=e("div",{class:"informe-tipo-content"},[e("span",{class:"informe-tipo-icon"},"📊"),e("span",{class:"informe-tipo-label"},"Trimestral"),e("span",{class:"informe-tipo-desc"},"Modelo 303 IVA")],-1))],2),e("label",{class:H(["informe-tipo-option",{selected:Z.value==="anual"}])},[B(e("input",{type:"radio","onUpdate:modelValue":t[37]||(t[37]=o=>Z.value=o),value:"anual"},null,512),[[ze,Z.value]]),t[126]||(t[126]=e("div",{class:"informe-tipo-content"},[e("span",{class:"informe-tipo-icon"},"📋"),e("span",{class:"informe-tipo-label"},"Anual"),e("span",{class:"informe-tipo-desc"},"Declaración IRPF")],-1))],2)]),e("div",Pn,[Z.value==="mensual"||Z.value==="trimestral"?(n(),r("div",En,[t[128]||(t[128]=e("label",null,"Mes",-1)),B(e("select",{"onUpdate:modelValue":t[38]||(t[38]=o=>De.value=o),class:"form-select"},[...t[127]||(t[127]=[e("option",{value:1},"Enero",-1),e("option",{value:2},"Febrero",-1),e("option",{value:3},"Marzo",-1),e("option",{value:4},"Abril",-1),e("option",{value:5},"Mayo",-1),e("option",{value:6},"Junio",-1),e("option",{value:7},"Julio",-1),e("option",{value:8},"Agosto",-1),e("option",{value:9},"Septiembre",-1),e("option",{value:10},"Octubre",-1),e("option",{value:11},"Noviembre",-1),e("option",{value:12},"Diciembre",-1)])],512),[[Se,De.value]])])):h("",!0),e("div",Dn,[t[129]||(t[129]=e("label",null,"Año",-1)),B(e("select",{"onUpdate:modelValue":t[39]||(t[39]=o=>pe.value=o),class:"form-select"},[(n(),r(de,null,ye([2024,2025,2026],o=>e("option",{key:o,value:o},l(o),9,Sn)),64))],512),[[Se,pe.value]])])]),e("div",Mn,[t[133]||(t[133]=e("div",{class:"informe-preview-header"},"Vista previa del informe",-1)),e("div",An,[e("div",Vn,[t[130]||(t[130]=e("span",{class:"preview-label"},"Tipo:",-1)),e("span",jn,l(Z.value==="mensual"?"Informe Mensual":Z.value==="trimestral"?"Informe Trimestral":"Informe Anual"),1)]),e("div",Rn,[t[131]||(t[131]=e("span",{class:"preview-label"},"Período:",-1)),e("span",Nn,[Z.value==="mensual"?(n(),r(de,{key:0},[j(l(new Date(pe.value,De.value-1).toLocaleDateString("es-ES",{month:"long",year:"numeric"})),1)],64)):Z.value==="trimestral"?(n(),r(de,{key:1},[j(l(Math.floor((De.value-1)/3)+1)+"º Trimestre "+l(pe.value),1)],64)):(n(),r(de,{key:2},[j(" Año "+l(pe.value),1)],64))])]),t[132]||(t[132]=e("div",{class:"preview-item"},[e("span",{class:"preview-label"},"Incluye:"),e("span",{class:"preview-value"},"Resumen financiero, desglose por método, datos fiscales")],-1))])])]),e("div",Tn,[e("button",{class:"btn-secondary",onClick:t[40]||(t[40]=o=>ke.value=!1)},"Cancelar"),e("button",{class:"btn-primary",onClick:t[41]||(t[41]=o=>bt(Z.value))},[...t[135]||(t[135]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",width:"18",height:"18"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"})],-1),j(" Generar PDF ",-1)])])])])])):h("",!0)]))])}}}),Kn=Dt(zn,[["__scopeId","data-v-3a9bae83"]]);export{Kn as default};
