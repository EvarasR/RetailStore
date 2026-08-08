from __future__ import annotations

from io import BytesIO

from django.db.models import QuerySet
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from apps.operaciones.models import Factura, PedidoDetalle, TransaccionPago
from apps.core.models import UsuarioRol


def facturas_visibles_para(user) -> QuerySet[Factura]:
    roles = set(UsuarioRol.objects.filter(cod_usuario=user).values_list("cod_rol__nombre", flat=True))
    queryset = Factura.objects.select_related(
        "cod_pedido",
        "cod_pedido__cod_usuario",
        "cod_pedido__cod_direccion_envio",
    )
    if user.is_staff or ("SUPPORT" in roles and user.has_perm("operaciones.factura.consultar")):
        return queryset
    return queryset.filter(cod_pedido__cod_usuario=user)


def obtener_factura_visible(user, cod_factura: int) -> Factura | None:
    return facturas_visibles_para(user).filter(cod_factura=cod_factura).first()


def _money(value) -> str:
    return f"${value}"


def _draw_branding(canvas, document):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(colors.HexColor("#0f172a"))
    canvas.rect(0, height - 24 * mm, width, 24 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#38bdf8"))
    canvas.circle(20 * mm, height - 12 * mm, 6 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawCentredString(20 * mm, height - 14 * mm, "TT")
    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(30 * mm, height - 14 * mm, "TechTail")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(18 * mm, 12 * mm, "Factura / comprobante generado por TechTail - No constituye autorizacion SRI.")
    canvas.drawRightString(width - 18 * mm, 12 * mm, f"Pagina {document.page}")
    canvas.restoreState()


def generar_factura_pdf(factura: Factura) -> bytes:
    pedido = factura.cod_pedido
    usuario = pedido.cod_usuario
    direccion = pedido.cod_direccion_envio
    detalles = PedidoDetalle.objects.filter(cod_pedido=pedido).select_related("cod_producto").order_by("cod_pedido_detalle")
    transaccion = (
        TransaccionPago.objects.filter(cod_pedido=pedido, cod_estado_pago_id="CAPTURADO")
        .select_related("cod_metodo_pago", "cod_estado_pago")
        .order_by("-fecha_actualizacion")
        .first()
    )

    output = BytesIO()
    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=32 * mm,
        bottomMargin=22 * mm,
        title=f"Factura TechTail {factura.numero_factura}",
        author="TechTail",
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Right", parent=styles["BodyText"], alignment=TA_RIGHT))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=8.5, leading=11))
    story = [
        Paragraph("Factura / comprobante generado por TechTail", styles["Title"]),
        Spacer(1, 3 * mm),
    ]

    document_rows = [
        [Paragraph("Documento", styles["Heading3"]), Paragraph("Cliente", styles["Heading3"])],
        [
            Paragraph(
                f"<b>Factura:</b> {factura.numero_factura}<br/>"
                f"<b>Pedido:</b> {pedido.numero_pedido}<br/>"
                f"<b>Fecha:</b> {factura.fecha_emision:%Y-%m-%d %H:%M}<br/>"
                f"<b>Estado:</b> {factura.estado}",
                styles["Small"],
            ),
            Paragraph(
                f"<b>Nombre:</b> {usuario.get_full_name() or usuario.email}<br/>"
                f"<b>Documento:</b> {usuario.documento_identidad or 'No registrado'}<br/>"
                f"<b>Correo:</b> {usuario.email}<br/>"
                f"<b>Direccion:</b> {direccion.linea1}, {direccion.ciudad}, {direccion.provincia}, {direccion.pais}",
                styles["Small"],
            ),
        ],
    ]
    info_table = Table(document_rows, colWidths=[84 * mm, 84 * mm])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([info_table, Spacer(1, 6 * mm)])

    item_rows = [["Producto / SKU", "Cant.", "Precio base DB", "Desc. DB P/Prime/C", "Subtotal DB"]]
    for detail in detalles:
        item_rows.append([
            Paragraph(f"{detail.cod_producto.nombre}<br/><font size='7'>{detail.cod_producto.sku}</font>", styles["Small"]),
            str(detail.cantidad),
            _money(detail.precio_base_unitario),
            Paragraph(
                f"{_money(detail.descuento_promocion_unitario)} / "
                f"{_money(detail.descuento_prime_unitario)} / "
                f"{_money(detail.descuento_cupon_unitario)}",
                styles["Small"],
            ),
            _money(detail.subtotal_linea),
        ])
    items_table = Table(item_rows, repeatRows=1, colWidths=[59 * mm, 13 * mm, 29 * mm, 39 * mm, 28 * mm])
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.extend([items_table, Spacer(1, 6 * mm)])

    totals = [
        ["Subtotal DB", _money(factura.subtotal)],
        ["Descuento DB", _money(factura.descuento)],
        [f"Impuestos DB ({factura.tasa_impuesto}%)", _money(factura.impuesto)],
        ["Envio DB", _money(factura.costo_envio)],
        ["Total DB", _money(factura.total)],
    ]
    totals_table = Table(totals, colWidths=[55 * mm, 35 * mm], hAlign="RIGHT")
    totals_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#0ea5e9")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.extend([totals_table, Spacer(1, 6 * mm)])

    if transaccion:
        metodo = transaccion.cod_metodo_pago
        payment_text = (
            f"<b>Pago:</b> {metodo.marca} terminada en {metodo.ultimos4} - "
            f"Estado: {transaccion.cod_estado_pago_id}"
        )
    else:
        payment_text = "<b>Pago:</b> No disponible en el comprobante."
    story.append(Paragraph(payment_text, styles["Small"]))
    document.build(story, onFirstPage=_draw_branding, onLaterPages=_draw_branding)
    return output.getvalue()
