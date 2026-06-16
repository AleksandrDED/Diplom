import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../api.js";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function DirectoriesPage() {
  const [objects, setObjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState("");

  const [openObj, setOpenObj] = useState(false);
  const [objName, setObjName] = useState("");
  const [objAddr, setObjAddr] = useState("");
  const [objCode, setObjCode] = useState("");

  const [openType, setOpenType] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [typeDesc, setTypeDesc] = useState("");

  const load = async () => {
    setError("");
    try {
      const [o, t] = await Promise.all([api.get("/directories/objects"), api.get("/directories/equipment-types")]);
      setObjects(o.data);
      setTypes(t.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка загрузки");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createObject = async () => {
    setError("");
    try {
      await api.post("/directories/objects", { name: objName, address: objAddr, code: objCode || null });
      setOpenObj(false);
      setObjName("");
      setObjAddr("");
      setObjCode("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Нет доступа (нужна роль manager/admin)");
    }
  };

  const createType = async () => {
    setError("");
    try {
      await api.post("/directories/equipment-types", { name: typeName, description: typeDesc || null });
      setOpenType(false);
      setTypeName("");
      setTypeDesc("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Нет доступа (нужна роль manager/admin)");
    }
  };

  return (
    <>
      <PageHeader
        title="Справочники"
        subtitle="Объекты охраны и типы технических средств охраны"
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenObj(true)}>
              Объект
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenType(true)}>
              Тип ТСО
            </Button>
          </Stack>
        }
      />

      {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Объекты
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {objects.map((o) => (
                  <Box key={o.id} sx={{ p: 2, borderRadius: 2, bgcolor: "#F8FAFC", border: "1px solid", borderColor: "divider" }}>
                    <Typography sx={{ fontWeight: 600 }}>{o.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {o.address}
                    </Typography>
                    {o.code ? (
                      <Typography variant="caption" color="text.secondary">
                        Код: {o.code}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
                {objects.length === 0 ? (
                  <Typography color="text.secondary">Объектов пока нет</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Типы ТСО
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {types.map((t) => (
                  <Box key={t.id} sx={{ p: 2, borderRadius: 2, bgcolor: "#F8FAFC", border: "1px solid", borderColor: "divider" }}>
                    <Typography sx={{ fontWeight: 600 }}>{t.name}</Typography>
                    {t.description ? (
                      <Typography variant="body2" color="text.secondary">
                        {t.description}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
                {types.length === 0 ? (
                  <Typography color="text.secondary">Типов пока нет</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openObj} onClose={() => setOpenObj(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Новый объект</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Наименование" value={objName} onChange={(e) => setObjName(e.target.value)} />
            <TextField label="Адрес" value={objAddr} onChange={(e) => setObjAddr(e.target.value)} />
            <TextField label="Код (опционально)" value={objCode} onChange={(e) => setObjCode(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenObj(false)}>Отмена</Button>
          <Button variant="contained" onClick={createObject} disabled={!objName || !objAddr}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openType} onClose={() => setOpenType(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Новый тип ТСО</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Название" value={typeName} onChange={(e) => setTypeName(e.target.value)} />
            <TextField label="Описание (опционально)" value={typeDesc} onChange={(e) => setTypeDesc(e.target.value)} multiline minRows={3} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenType(false)}>Отмена</Button>
          <Button variant="contained" onClick={createType} disabled={!typeName}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
