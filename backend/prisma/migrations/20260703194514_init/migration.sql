-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "vocabulario" JSONB NOT NULL,
    "logo_url" TEXT,
    "whatsapp_phone_id" TEXT,
    "email_respaldo" TEXT,
    "mp_user_id" TEXT,
    "mp_access_token" TEXT,
    "mp_refresh_token" TEXT,
    "mp_conectado" BOOLEAN NOT NULL DEFAULT false,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "referencia" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deudas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "vencimiento" DATE NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "paso_secuencia" INTEGER NOT NULL DEFAULT 0,
    "mp_preference_id" TEXT,
    "mp_payment_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deudas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobros" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "deuda_id" UUID NOT NULL,
    "numero_recibo" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "medio" TEXT NOT NULL,
    "via" TEXT NOT NULL,
    "mp_payment_id" TEXT,
    "recibo_enviado_wa" BOOLEAN NOT NULL DEFAULT false,
    "recibo_enviado_email" BOOLEAN NOT NULL DEFAULT false,
    "cobrado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cobros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "deuda_id" UUID NOT NULL,
    "direccion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "wa_message_id" TEXT,
    "estado_entrega" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tenant_id_whatsapp_key" ON "clientes"("tenant_id", "whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "cobros_mp_payment_id_key" ON "cobros"("mp_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "cobros_tenant_id_numero_recibo_key" ON "cobros"("tenant_id", "numero_recibo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deudas" ADD CONSTRAINT "deudas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deudas" ADD CONSTRAINT "deudas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_deuda_id_fkey" FOREIGN KEY ("deuda_id") REFERENCES "deudas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_deuda_id_fkey" FOREIGN KEY ("deuda_id") REFERENCES "deudas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
