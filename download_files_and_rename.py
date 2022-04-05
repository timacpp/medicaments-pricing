# http://leki.urpl.gov.pl/index.php?id=%27%%27

import argparse
import os.path
import urllib.request
import requests
from urllib.error import HTTPError
from bs4 import BeautifulSoup
import re
import csv

def read_path(directory_name):
    parser = argparse.ArgumentParser()
    parser.add_argument("dir", help="Name of the directory to save files")
    args = parser.parse_args()

    return args.dir

def fetch_url(homepage):
    html_file = urllib.request.urlopen(homepage)
    soup = BeautifulSoup(html_file, 'html.parser')
#    print(soup.prettify())

    return soup


def find_links(soup):
    medicines = []

    set_of_links = [link.get('href') for link in soup.find_all('a')]
#    print(set_of_links)
    index = 0

    while set_of_links[index][0] != '?':
#        print(set_of_links[index])
        if re.search("bwieszczenie", set_of_links[index]) is not None:
            medicines.append('https://www.gov.pl' + set_of_links[index])
        index += 1

    return medicines



def print_medicines(list_od_medicines):
    for med in list_od_medicines:
        print(med)



def open_medicines(list_of_medicines, folder): #, writer):
    count = 0
    for link in list_of_medicines:
#        print(link)
        try :
            html_file = urllib.request.urlopen(link)
            soup = BeautifulSoup(html_file, 'html.parser')
#            print(soup.prettify())
            title = soup.title.string
            noticed = False
            result_row = ["", "", "", link]
            previous = ""
            for para in soup.find_all("a", {"class":"file-download"}, href=True): #h3
#                print(para.get_text())
                stringified = para.get_text()
                if re.search("\.xlsx", stringified) and re.search("cznik", stringified):
 #               if re.search("\.xlsx", stringified):
#                    print(para.get_text())
                    print(para['href'])
                    count += 1
                    # if not noticed:
                    #     title_list = title.split()[:2]
                    #     noticed = True
                    #     result_row[0] = title_list[0]
                    #     result_row[1] = title_list[1]
                    #     print(title_list)
                    # #print(para.next_sibling.get_text())
                    # next = para.find_next('p')
                    # next_text = next.get_text()
                    # if next_text != previous:
                    #     result_row[2] += next_text + '\n'
                    #     previous = next_text
                    # print(next_text)

            # if noticed:
            #     for active in soup.find_all('dt'):
            #         stringified_active = active.get_text()
            #         #print(stringified_active)
            #         if re.search("Substancje aktywne", stringified_active):
            #             print(stringified_active)
            #             next = active.find_next('div')
            #             next_text = next.get_text()
            #             splitted = next_text.split('  ')
            #             #print(splitted)
            #             res_splitted = [el for el in splitted if el != '' and el != '\n']
            #             print(res_splitted)
            #             res_string = " ".join(res_splitted)
            #             print(res_string)
            #             result_row.append(res_string)
            #
            #     # for indications in soup.find_all('button'):
            #     #     stringified_button = indications.get_text()
            #     #     print(stringified_button, " button")
            #
            #     for ind in soup.find_all('h3'):
            #         stringified_ind = ind.get_text()
            #         #print(stringified_ind, " h2")
            #         res = []
            #         if re.search("Wskazania", stringified_ind):
            #             next = ind.find_next('p')
            #             next_text = next.get_text()
            #             result_row.append(next_text)
            #             print(next_text)
            #
            #     for ind2 in soup.find_all('dt'):
            #         stringified_ind2 = ind2.get_text()
            #         #print(stringified_ind2, "ind2")
            #         if re.search("Działanie", stringified_ind2):
            #             next = ind2.find_next('div')
            #             next_text = next.get_text()
            #             splitted = next_text.split('  ')
            #             # print(splitted)
            #             res_splitted = [el for el in splitted if el != '' and el != '\n']
            #             print(res_splitted)
            #             res_string = " ".join(res_splitted)
            #             print(res_string)
            #             result_row.append(res_string)
            #
            #     writer.writerow(result_row)
            #     print(result_row)
            #     print("WRITTEN")

        except HTTPError as err:
            if err.code == 404:
                pass
            else:
                raise
    return count

def download_file_from_url(url, dest_folder, date, new_name):
    if not os.path.exists(folder):
        os.makedirs(folder)

    previous_name = url.split('/')[-1]
    file_path=os.path.join(dest_folder, new_name)
    req = requests.get(url, stream=True)
    if req.ok:
        print("Saving {prev_name} to {new_name}".format(prev_name = previous_name,
                                                        new_name = dest_folder +
                                                                   "/" + new_name))
        with open(file_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024 * 8):
                if chunk:
                    f.write(chunk)
                    f.flush()
                    os.fsync(f.fileno())
    else:
        print("Download failed: {name}".format(name = previous_name))

def find_pairs_links(soup):
    for link in soup.find_all('a'):
        title = link.get('href')
        print(title)

if __name__ == '__main__':
    url = 'https://www.gov.pl/web/zdrowie/obwieszczenia-ministra-zdrowia-lista-lekow-refundowanych?page=' #1
    #soup = fetch_url(url)
    #medicines = find_links(soup)
    #print_medicines(medicines)
    counter = 0
    with open("lekiPelne.csv", "w", newline='') as csfile:
#        writer = csv.writer(csfile)
#        writer.writerow(["Polska nazwa", "Angielska nazwa", "Interakcje", "Strona",  "Substancja aktywna", "Wskazania", "Działanie"])
        for page in range (1, 4):
            new_page = url + str(page)
            soup = fetch_url(new_page)
#            find_pairs_links(soup)
            medicines = find_links(soup)
#            print(medicines)
            counter += open_medicines(medicines) #, writer)
   # print(response)
        print(counter)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
