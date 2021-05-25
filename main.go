package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/ledongthuc/pdf"
)

func main() {
	pdf.DebugOn = true
	content, err := readPdf("test.pdf") // Read local pdf file
	if err != nil {
		panic(err)
	}
	fmt.Println(content)
	return
}

func readPdf(path string) ([]string, error) {
	var res []string
	f, r, err := pdf.Open(path)
	// remember close file
	defer f.Close()
	if err != nil {
		res = append(res, "")
		return res, err
	}
	totalPage := r.NumPage()

	for pageIndex := 1; pageIndex <= totalPage; pageIndex++ {
		p := r.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}
		texts, _ := p.GetTextByRow()
		j, err := json.Marshal(texts)
		if err != nil {
			log.Fatalf("Error occured during marshaling. Error: %s", err.Error())
		}
		res = append(res, string(j))
	}
	return res, nil
}
