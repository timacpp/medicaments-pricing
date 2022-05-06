# http://leki.urpl.gov.pl/index.php?id=%27%%27

import argparse
import os.path
import urllib.request
import requests
from urllib.error import HTTPError
from bs4 import BeautifulSoup
import re
import csv

def read_path():
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

def download_file_from_url(url, dest_folder, date, new_name):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    previous_name = url.split('/')[-1]
    file_path=os.path.join(dest_folder, new_name + '-' + date + ".xlsx")
    heads = {
        "Content-Type": "text",
        "Accept-Encoding": "gzip, deflate, br"
    }
    req = requests.get(url, stream=True, headers=heads)
    if req.ok:
        print("Saving {prev_name} to {new_name}".format(prev_name = previous_name,
                                                        new_name = dest_folder +
                                                                   "/" + new_name
                                                                    + '-' + date))
        with open(file_path, 'wb') as f:
            # for chunk in req.iter_content(chunk_size=1024 * 8):
            #     if chunk:
            #         f.write(chunk)
            #         f.flush()
            #         os.fsync(f.fileno())
            f.write(req.content)
    else:
        print("Download failed: {name}".format(name = previous_name))

def get_date(to_extract):
    splitted = to_extract.split('-')
#    counter = 0
    to_return = ""
    for ind in range(0, len(splitted)):
        if splitted[ind][0].isnumeric():
            if int(splitted[ind]) > 2000:
#                return splitted[ind - 2] + "-" + splitted[ind - 1] + "-" + splitted[ind]
                to_return += splitted[ind - 2] + "-" + splitted[ind - 1] + "-" + splitted[ind] + "__"

    return to_return[:-2]

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
                    link_content = link.split('/')[-1]
                    date = get_date(link_content)
                    print(link_content)
                    print(date + '\n')
#                    print(para['href'])
                    download_file_from_url('https://www.gov.pl' + para['href'],
                                           folder, date, link_content.split('-')[0])
                    count += 1

        except HTTPError as err:
            if err.code == 404:
                pass
            else:
                raise
    return count

# def download_file_from_url(url, dest_folder, date, new_name):
#     if not os.path.exists(folder):
#         os.makedirs(folder)
#
#     previous_name = url.split('/')[-1]
#     file_path=os.path.join(dest_folder, new_name)
#     req = requests.get(url, stream=True)
#     if req.ok:
#         print("Saving {prev_name} to {new_name}".format(prev_name = previous_name,
#                                                         new_name = dest_folder +
#                                                                    "/" + new_name))
#         with open(file_path, 'wb') as f:
#             for chunk in r.iter_content(chunk_size=1024 * 8):
#                 if chunk:
#                     f.write(chunk)
#                     f.flush()
#                     os.fsync(f.fileno())
#     else:
#         print("Download failed: {name}".format(name = previous_name))

def find_pairs_links(soup):
    for link in soup.find_all('a'):
        title = link.get('href')
        print(title)

if __name__ == '__main__':
    url = 'https://www.gov.pl/web/zdrowie/obwieszczenia-ministra-zdrowia-lista-lekow-refundowanych?page=' #1
    #soup = fetch_url(url)
    #medicines = find_links(soup)
    #print_medicines(medicines)
    folder_name = read_path()
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
            counter += open_medicines(medicines, folder_name) #, writer)
   # print(response)
        print("Total number:", counter)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
