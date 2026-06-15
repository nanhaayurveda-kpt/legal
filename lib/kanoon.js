const BASE = "https://api.indiankanoon.org";

// Indian Kanoon API को request — POST + Token auth, जवाब JSON में
async function ikRequest(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.INDIAN_KANOON_TOKEN}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Indian Kanoon API error: ${res.status}`);
  }
  return res.json();
}

// केस लॉ खोजो — formInput query, pagenum 0 से, doctypes वैकल्पिक filter
export async function searchKanoon(query, { pagenum = 0, doctypes } = {}) {
  const params = new URLSearchParams({
    formInput: query,
    pagenum: String(pagenum),
  });
  if (doctypes) params.set("doctypes", doctypes);

  const data = await ikRequest(`/search/?${params.toString()}`);

  // सिर्फ़ ज़रूरी fields लौटाओ
  return (data.docs || []).map((d) => ({
    tid: d.tid,            // document id
    title: d.title,
    headline: d.headline,  // snippet
    source: d.docsource,   // कोर्ट
    url: `https://indiankanoon.org/doc/${d.tid}/`, // असली source link
  }));
}

// पूरा जजमेंट लाओ — docid से
export async function getDocument(docid) {
  const data = await ikRequest(`/doc/${docid}/`);
  return {
    tid: docid,
    title: data.title,
    text: data.doc,        // जजमेंट का पूरा text
    url: `https://indiankanoon.org/doc/${docid}/`, // वकील ख़ुद जाँचे
  };
}