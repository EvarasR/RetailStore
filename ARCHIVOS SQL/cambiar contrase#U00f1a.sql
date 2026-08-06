CREATE OR REPLACE FUNCTION public.fn_restablecer_contrasena_usuario(
    p_email TEXT,
    p_nueva_contrasena TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actualizados INTEGER;
    v_salt TEXT;
BEGIN
    IF p_email IS NULL OR btrim(p_email) = '' THEN
        RAISE EXCEPTION 'El correo es obligatorio.';
    END IF;

    IF p_nueva_contrasena IS NULL OR length(p_nueva_contrasena) < 8 THEN
        RAISE EXCEPTION 'La nueva contraseña debe tener al menos 8 caracteres.';
    END IF;

    -- Salt variable sin depender de extensiones adicionales.
    v_salt := md5(
        lower(btrim(p_email))
        || clock_timestamp()::TEXT
        || random()::TEXT
    );

    UPDATE usuario
       SET password_hash = fn_generar_password_hash_django(
               p_nueva_contrasena,
               v_salt,
               120000
           ),
           fecha_actualizacion = now()
     WHERE lower(email) = lower(btrim(p_email))
       AND activo = TRUE;

    GET DIAGNOSTICS v_actualizados = ROW_COUNT;

    IF v_actualizados = 0 THEN
        RAISE EXCEPTION 'No existe una cuenta activa con ese correo.';
    END IF;

    RETURN TRUE;
END;
$$;


SELECT public.fn_restablecer_contrasena_usuario(
    'admin@retailprime.local',
    'admin123.'
);